#include <core.h>
#include <platform.h>
#include <list.h>
#include <websock.h>
#include <str.h>
#ifdef CORE_USE_WINDOWS
#include <psapi.h>
#endif
#include "defines.h"

static inline cs_str getcodestr(cs_uint32 code) {
	switch (code) {
		case 101: return "Switching Protocols";
		case 200: return "OK";
		case 400: return "Bad Request";
		case 404: return "Not Found";
		case 414: return "Request-URI Too Long";
		case 500: return "Internal Server Error";
		default: return "Unknown";
	}
}

static cs_str testurl(cs_str url) {
	static cs_str const pages[] = {
		"/console", "/configeditor",
		"/pluginmanager", NULL
	};

	for (cs_int32 i = 0; pages[i]; i++)
		if (String_FindSubstr(url, pages[i]))
			return "/index.html";

	return url;
}

static inline cs_str guessmime(cs_str path) {
	static cs_str const mimes[] = { NULL,
		"text/html", "html", "htm", NULL,
		"text/javascript", "js", NULL,
		"text/css", "css", NULL,
		"text/plain", "txt", NULL,
		"application/json", "json", NULL,
		"image/png", "png", NULL,
		"image/gif", "gif", NULL,
		"image/ico", "ico"
	};

	cs_char *ext = String_LastChar(path, '.') + 1;
	for (cs_int32 i = 0; i < (cs_int32)(sizeof(mimes) / sizeof(mimes[0])); i++) {
		static cs_str cmime = NULL;
		if (mimes[i] == NULL) {
			cmime = mimes[++i];
			continue;
		}
		if (String_CaselessCompare(ext, mimes[i]))
			return cmime;
	}

	return "application/octet-stream";
}

static inline cs_bool checkhttp(cs_char *buffer) {
	if (!Memory_Compare((void *)buffer, (void *)"GET /", 5)) return false;
	cs_char *fs = String_LastChar(buffer, ' ');
	if (!fs) return false; *fs++ = '\0';
	if (String_Compare(fs, "HTTP/1.1")) {
		fs = String_FirstChar(buffer, '?');
		if (fs) *fs = '\0';
		return true;
	}

	return false;
}

static inline void applyheaders(NetBuffer *nb, cs_uint32 code, cs_int32 len, cs_str type, cs_str add) {
	static cs_str const http = "HTTP/1.1 %d %s\r\nServer: cserver-cpl\r\n"
	"Content-Type: %s\r\nContent-Length: %lu\r\n%s\r\n%s";

	if (!type) type = "application/octet-stream";
	cs_str codestr = getcodestr(code);
	if (code != 200) len = (cs_int32)String_Length(codestr);
	cs_int32 sz = String_FormatBuf(
		NULL, 0, http, code, codestr, type,
		len, add ? add : "", code == 200 ? "" : codestr
	) + 1;
	NetBuffer_EndWrite(nb, String_FormatBuf(
		NetBuffer_StartWrite(nb, sz),
		sz, http, code, codestr, type,
		len, add ? add : "", code == 200 ? "" : codestr
	));
}

THREAD_PUBFUNC(WebThread) {(void)param;
	WebState.stopped = false;

	while (!WebState.stopped || WebState.clients != NULL) {
		Mutex_Lock(WebState.mutex);
		struct sockaddr_in ssa;
		Socket fdc;
		while ((fdc = Socket_Accept(WebState.fd, &ssa)) != -1) {
			if (!Socket_IsLocal(ssa.sin_addr.s_addr)) {
				Socket_Close(fdc);
				continue;
			}
			struct _HttpClient *hc = Memory_Alloc(1, sizeof(struct _HttpClient));
			NetBuffer_Init(&hc->nb, fdc);
			hc->state = CHS_INITIAL;
			hc->cpls = NULL;
			hc->ssa = ssa;
			hc->code = 200;
			AList_AddField(&WebState.clients, hc);
		}

		AListField *tmp;
		List_Iter(tmp, WebState.clients) {
			struct _HttpClient *hc = AList_GetValue(tmp).ptr;
			if (hc->state == CHS_CLOSED) {
				NetBuffer_ForceClose(&hc->nb);
				AList_Remove(&WebState.clients, tmp);
				if (hc->file) File_Close(hc->file);
				if (hc->wsh) {
					if (hc->cpls) WebState.ustates[hc->cpls->wsstate]--;
					Memory_Free(hc->wsh);
				}
				Memory_Free(hc);
				break;
			}

			if (!NetBuffer_Process(&hc->nb))
				hc->state = CHS_CLOSED;

			if (WebState.stopped)
				hc->state = CHS_CLOSING;

			cs_char buffer[512] = {0}, path[128] = "./webdata";
			switch (hc->state) {
				case CHS_INITIAL:
					if (NetBuffer_AvailRead(&hc->nb) >= 8) {
						if (String_CaselessCompare2(NetBuffer_PeekRead(&hc->nb, 8), "GET /ws ", 8)) {
							hc->wsh = Memory_TryAlloc(1, sizeof(WebSock) + sizeof(struct _CplState));
							if (!hc->wsh) {
								hc->state = CHS_CLOSING;
								break;
							}
							hc->cpls = (void *)((cs_char *)hc->wsh + sizeof(WebSock));
							hc->wsh->proto = "cserver-cpl";
							hc->wsh->maxpaylen = 32 * 1024;
							hc->cpls->wsstate = WSS_INVALID;
							hc->state = CHS_UPGRADING;
						} else hc->state = CHS_REQUEST;
					}
					break;
				case CHS_UPGRADING:
					while (WebSock_Tick(hc->wsh, &hc->nb))
						if (hc->wsh->paylen > 0)
							handlewebsockmsg(hc);

					if (WebSock_GetErrorCode(hc->wsh) != WEBSOCK_ERROR_CONTINUE) {
						WL(Error, "WebSocket error: %s", WebSock_GetError(hc->wsh));
						hc->state = CHS_CLOSING;
						break;
					}
					break;
				case CHS_REQUEST:
						switch (NetBuffer_ReadLine(&hc->nb, buffer, 144)) {
							case -2: // Ожидаем ещё данные, строка не завершена
								break;

							case -1:
								hc->code = 414;
								hc->state = CHS_ERROR;
								break;

							case 0:
								hc->code = 400;
								hc->state = CHS_ERROR;
								break;

							default:
								if (checkhttp(buffer)) {
									String_Append(path, 128, testurl(String_FirstChar(buffer, ' ') + 1));
									if (*(String_LastChar(path, '/') + 1) == '\0')
										String_Append(path, 128, "index.html");
									if (String_FindSubstr(path, "..")) {
										hc->state = CHS_CLOSING;
										break;
									}
									if ((hc->file = File_Open(path, "rb")) != NULL) {
										hc->type = guessmime(path);
										hc->state = CHS_HEADERS;
										break;
									}

									hc->state = CHS_ERROR;
									hc->code = 404;
									break;
								}

								hc->state = CHS_CLOSING;
								break;
						}
					break;
				case CHS_HEADERS:
					while (hc->state == CHS_HEADERS) {
						static cs_bool stop = false;
						if (stop) break;

						switch (NetBuffer_ReadLine(&hc->nb, buffer, 512)) {
							case -2:
								stop = true;
								break;

							case -1:
								hc->state = CHS_CLOSING;
								break;

							case 0:
								hc->state = CHS_SENDFILE;
								break;
						}

						if (!NetBuffer_Process(&hc->nb))
							hc->state = CHS_CLOSING;
					}

					break;
				case CHS_SENDFILE: {
					cs_ulong size = File_Seek(hc->file, 0, SEEK_END);
					File_Seek(hc->file, 0, SEEK_SET);
					applyheaders(&hc->nb, hc->code, size, hc->type, NULL);
					if (File_Read(NetBuffer_StartWrite(&hc->nb, size), size, 1, hc->file) == 1)
						NetBuffer_EndWrite(&hc->nb, size);
					hc->state = CHS_CLOSING;
					break;
				}
				case CHS_ERROR:
					applyheaders(&hc->nb, hc->code, 0, "text/html", NULL);
					hc->state = CHS_CLOSING;
					break;
				case CHS_CLOSING:
					if (NetBuffer_AvailWrite(&hc->nb) == 0)
						hc->state = CHS_CLOSED;
				case CHS_CLOSED:
					break;
			}
		}

		static cs_uint64 lastupd = 0, prevmem = 0;
		cs_uint64 ctime = Time_GetMSec();
		if (lastupd < ctime) {
			prevmem = WebState.usagemem;
#			if defined(CORE_USE_WINDOWS)
				PROCESS_MEMORY_COUNTERS_EX pmc;

				if (GetProcessMemoryInfo(GetCurrentProcess(), (void *)&pmc, sizeof(pmc)))
					WebState.usagemem = pmc.PrivateUsage / (1024 * 1024);
#			elif defined(CORE_USE_DARWIN)
					WebState.usagemem = -1;
#			elif defined(CORE_USE_UNIX)
				cs_char line[1024];
				cs_file stat = File_Open("/proc/self/status", "r");
				if (stat) {
					while (File_ReadLine(stat, line, sizeof(line)) > 0) {
						if (Memory_Compare((void *)line, (void *)"VmRSS:", 6)) {
							for (cs_size i = 7; i < sizeof(line); i++) {
								if (line[i] == '\x20') continue;
								WebState.usagemem = (cs_size)String_ToInt(&line[i]) / 1024;
								break;
							}
						}
					}
					File_Close(stat);
				}
#			endif

			if (prevmem != WebState.usagemem) {
				List_Iter(tmp, WebState.clients) {
					struct _HttpClient *hc = AList_GetValue(tmp).ptr;
					if (!hc->cpls || hc->cpls->wsstate != WSS_HOME) continue;
					genpacket(&hc->nb, "R6", WebState.usagemem);
				}
			}

			lastupd = ctime + 5000;
		}

		Mutex_Unlock(WebState.mutex);
		Thread_Sleep(16);
	}

	return 0;
}
