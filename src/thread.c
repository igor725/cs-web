#include <core.h>
#include <platform.h>
#include <list.h>
#include <websock.h>
#include <str.h>

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

static inline void applyheaders(NetBuffer *nb, cs_uint32 code, cs_int32 len, cs_str type) {
	static cs_str const http = "HTTP/1.1 %d %s\r\nServer: cserver-cpl\r\n"
	"Content-Type: %s\r\nContent-Length: %lu\r\n\r\n%s";

	if (!type) type = "application/octet-stream";
	cs_str codestr = getcodestr(code);
	if (code != 200) len = (cs_int32)String_Length(codestr);
	cs_int32 sz = String_FormatBuf(
		NULL, 0, http, code, codestr, type,
		len, code == 200 ? "" : codestr
	) + 1;
	NetBuffer_EndWrite(nb, String_FormatBuf(
		NetBuffer_StartWrite(nb, sz),
		sz, http, code, codestr, type,
		len, code == 200 ? "" : codestr
	));
}

THREAD_PUBFUNC(WebThread) {(void)param;
	WebState.stopped = false;
	while (true) {
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
			WL(Debug, "New client! %d:%d", ssa.sin_addr, ssa.sin_port);
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
				WL(Debug, "Client closed!");
				break;
			}

			if (!NetBuffer_Process(&hc->nb))
				hc->state = CHS_CLOSED;

			if (WebState.stopped)
				hc->state = CHS_CLOSING;

			cs_char buffer[512] = {0}, path[128] = "webdata/.";
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
									hc->file = File_Open(path, "rb");
									if (hc->file == NULL) {
										hc->state = CHS_ERROR;
										hc->code = 404;
										break;
									}
									hc->type = guessmime(path);
									hc->state = CHS_HEADERS;
								} else
									hc->state = CHS_CLOSING;
								break;
						}
					break;
				case CHS_HEADERS:
					while (hc->state == CHS_HEADERS) {
						switch (NetBuffer_ReadLine(&hc->nb, buffer, 512)) {
							case -2: break;

							case -1:
								hc->state = CHS_CLOSING;
								break;

							case 0:
								hc->state = CHS_SENDFILE;
								break;

							default:
								// WL(Debug, "Header: %s", buffer);
								break;
						}

						if (!NetBuffer_Process(&hc->nb))
							hc->state = CHS_CLOSING;
					}

					break;
				case CHS_SENDFILE:
					applyheaders(&hc->nb, hc->code, File_Seek(hc->file, 0, SEEK_END), hc->type);
					File_Seek(hc->file, 0, SEEK_SET);
					while (!File_IsEnd(hc->file)) {
						NetBuffer_EndWrite(&hc->nb, (cs_uint32)File_Read(
							NetBuffer_StartWrite(&hc->nb, 256), 1, 256, hc->file
						));
					}
					hc->state = CHS_CLOSING;
					break;
				case CHS_ERROR:
					applyheaders(&hc->nb, hc->code, 0, "text/html");
					hc->state = CHS_CLOSING;
					break;
				case CHS_CLOSING:
					if (NetBuffer_AvailWrite(&hc->nb) == 0)
						hc->state = CHS_CLOSED;
				case CHS_CLOSED:
					break;
			}
		}

		Mutex_Unlock(WebState.mutex);
		if (WebState.stopped && WebState.clients == NULL) break;
		Thread_Sleep(60);
	}

	return 0;
}
