#include <core.h>
#include <plugin.h>
#include <websock.h>
#include <platform.h>
#include <netbuffer.h>
#include <command.h>
#include <strstor.h>
#include <event.h>
#include <list.h>
#include <log.h>

Plugin_SetVersion(1);
Plugin_SetURL("https://github.com/igor725/cs-web");

#define WL(I, T, ...) Log_##I("WebPanel: " T,  ##__VA_ARGS__)

enum _HttpStatus {
	CHS_INITIAL,
	CHS_REQUEST,
	CHS_UPGRADING,
	CHS_HEADERS,
	CHS_BODY,
	CHS_ERROR,
	CHS_CLOSING,
	CHS_CLOSED
};

enum _WsState {
	WSS_INVALID,
	WSS_HOME,
	WSS_CONSOLE,
	WSS_CFGEDIT,
	WSS_PLUGINS,

	WSS_MAXVAL
};

static enum _WsState ustate(cs_char s) {
	switch (s) {
		case 'H': return WSS_HOME;
		case 'R': return WSS_CONSOLE;
		case 'C': return WSS_CFGEDIT;
		case 'E': return WSS_PLUGINS;
		default:  return WSS_INVALID;
	}
}

struct _CplState {
	enum _WsState wsstate;
	cs_bool authed;
};

struct _HttpClient {
	enum _HttpStatus state;
	struct sockaddr_in ssa;
	cs_uint16 code;
	cs_str type;
	cs_file file;
	NetBuffer nb;
	WebSock *wsh;
	struct _CplState *cpls;
};

static struct _WebState {
	cs_bool stopped, alive;
	Mutex *mutex;
	Thread thread;
	Socket fd;
	AListField *clients;

	cs_uint32 ustates[WSS_MAXVAL];
	cs_byte pwhash[33];
} WebState;

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
	for (cs_int32 i = 0; i < (sizeof(mimes) / sizeof(mimes[0])); i++) {
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

static void sendsockmsg(struct _HttpClient *hc, void *msg, cs_uint32 len) {
	Memory_Copy(NetBuffer_StartWrite(&hc->nb, len), msg, len);
	NetBuffer_EndWrite(&hc->nb, len);
}

static cs_int32 readint(cs_byte **data) {
	cs_int32 i = String_StrToLong((cs_str)*data, (cs_char **)data, 10);
	(*data)++; return i;
}

static cs_str readstr(cs_byte **data) {
	cs_str ret = (cs_char *)*data;
	*data += String_Length(ret) + 1;
	return ret;
}

static cs_uint32 readargc(cs_byte *data, cs_uint16 len) {
	cs_uint32 argc = 0;
	for (; len > 1; len--)
		if (*data++ == '\0') argc++;
	return argc;
}

static void genpacket(NetBuffer *nb, cs_str fmt, ...) {
	va_list args;
	va_start(args, fmt);
	cs_str temps;
	cs_int32 tempi;
	cs_int32 size;

	while (*fmt != '\0') {
		switch (*fmt) {
			case 'i':
				tempi = va_arg(args, cs_int32);
				if ((size = String_FormatBuf(NULL, 0, "%d", tempi)) > 0) {
					NetBuffer_EndWrite(nb, String_FormatBuf(
						NetBuffer_StartWrite(nb, size + 1),
						size + 1, "%d", tempi
					) + 1);
				}
				break;
			case 's':
				temps = va_arg(args, cs_str);
				size = (cs_int32)(String_Length(temps) + 1);
				NetBuffer_EndWrite(nb, (cs_int32)String_Copy(NetBuffer_StartWrite(
					nb, (cs_uint32)size), (cs_int32)size, temps
				) + 1);
				break;

			default:
				*NetBuffer_StartWrite(nb, 1) = *fmt;
				NetBuffer_EndWrite(nb, 1);
				break;
		}

		++fmt;
	}
	va_end(args);
}

static void handlewebsockmsg(struct _HttpClient *hc) {
	cs_byte *data = (cs_byte *)hc->wsh->payload;
	while (hc->state < CHS_CLOSING && (data - (cs_byte *)hc->wsh->payload) < hc->wsh->paylen) {
		if (!hc->cpls->authed) {
			if (*data != 'A') {
				genpacket(&hc->nb, "Nss", "E", "You need to log in first");
				break;
			}

			if (hc->wsh->paylen < 34) {
				genpacket(&hc->nb, "Nss", "E", "Invalid auth packet received");
				break;
			}

			if (Memory_Compare(WebState.pwhash, data + 1, 32)) {
				sendsockmsg(hc, "AOK\0", 4);
				hc->cpls->authed = true;
			} else sendsockmsg(hc, "AFAIL\0", 6);

			data += 34;
			continue;
		}

		switch (*data++) {
			case 'B':
				genpacket(&hc->nb, "Bsi", readstr(&data), 1);
				readstr(&data); readint(&data);
				break;

			case 'C':
				if (!Command_Handle(readstr(&data), NULL))
					genpacket(&hc->nb, "Cs", Sstor_Get("CMD_UNK"));
				break;

			case 'F':
				for(cs_int32 i = 0; i < 5; i++)
					genpacket(&hc->nb, "Nss", "W", "Fuck!!");
				break;

			case 'K':
				readstr(&data);
				genpacket(&hc->nb, "Psi", "R", 1);
				break;
			
			case 'O':
				readstr(&data); readint(&data);
				genpacket(&hc->nb, "Psii", "O", 1, 1);
				break;

			case 'S':
				WebState.ustates[hc->cpls->wsstate]--;
				hc->cpls->wsstate = ustate(*readstr(&data));
				if (hc->cpls->wsstate == WSS_INVALID) {
					hc->state = CHS_CLOSING;
					break;
				}
				WebState.ustates[hc->cpls->wsstate]++;
				WL(Debug, "State changed to %d", hc->cpls->wsstate);
				break;

			default:
				genpacket(&hc->nb, "Nss", "E", "Failed to handle unknown message");
				data += hc->wsh->paylen;
				break;
		}
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

THREAD_FUNC(WebThread) {(void)param;
	while (true) {
		if (!WebState.alive) continue;

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
							hc->cpls->wsstate = WSS_HOME;
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
								hc->state = CHS_BODY;
								break;

							default:
								// WL(Debug, "Header: %s", buffer);
								break;
						}

						if (!NetBuffer_Process(&hc->nb))
							hc->state = CHS_CLOSING;
					}

					break;
				case CHS_BODY:
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

static void evtpoststart(void *p) {(void)p;
	WebState.fd = Socket_New();
	struct sockaddr_in ssa;
	if (Socket_SetAddr(&ssa, "0.0.0.0", 8887) < 0) {
		Socket_Close(WebState.fd);
		WL(Error, "Failed to set socket address");
		return;
	}

	if (!Socket_SetNonBlocking(WebState.fd, true)) {
		Socket_Close(WebState.fd);
		WL(Error, "Failed to set non-blocking option");
		return;
	}

	if (!Socket_Bind(WebState.fd, &ssa)) {
		Socket_Close(WebState.fd);
		WL(Error, "Failed to bind port 8887");
		return;
	}

	WebState.alive = true;
	WL(Info, "Listener started on *:8887");
}

static void evtonlog(void *param) {
	if (WebState.clients) {
		LogBuffer *lb = param;
		if (lb->flag & LOG_DEBUG) return;

		AListField *tmp;
		Mutex_Lock(WebState.mutex);
		List_Iter(tmp, WebState.clients) {
			struct _HttpClient *hc = AList_GetValue(tmp).ptr;
			if (!hc->cpls || hc->cpls->wsstate != WSS_CONSOLE) continue;
			genpacket(&hc->nb, "Cs", lb->data);
		}
		Mutex_Unlock(WebState.mutex);
	}
}

Event_DeclareBunch(events) {
	EVENT_BUNCH_ADD('v', EVT_POSTSTART, evtpoststart),
	EVENT_BUNCH_ADD('v', EVT_ONLOG, evtonlog),

	EVENT_BUNCH_END
};

cs_bool Plugin_Load(void) {
	String_Copy((cs_char *)WebState.pwhash, 33, "098f6bcd4621d373cade4e832627b4f6");
	WebState.mutex = Mutex_Create();
	WebState.thread = Thread_Create(WebThread, NULL, false);
	return Event_RegisterBunch(events);
}

cs_bool Plugin_Unload(cs_bool force) {(void)force;
	Event_UnregisterBunch(events);
	WebState.stopped = true;
	Thread_Join(WebState.thread);
	Socket_Close(WebState.fd);
	Mutex_Free(WebState.mutex);
	return true;
}
