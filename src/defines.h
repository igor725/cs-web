#ifndef WEBDEFINES_H
#define WEBDEFINES_H
#include <core.h>
#include <platform.h>
#include <config.h>
#include <websock.h>
#include <event.h>
#include <netbuffer.h>
#include <log.h>

#define WL(I, T, ...) Log_##I("WebPanel: " T,  ##__VA_ARGS__)

enum _HttpStatus {
	CHS_INITIAL,
	CHS_REQUEST,
	CHS_UPGRADING,
	CHS_HEADERS,
	CHS_SENDFILE,
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

struct _CplState {
	enum _WsState wsstate;
	cs_bool authed;
	cs_char lasttc[13];
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

#define LOGLIST_SIZE 40

struct _WebState {
	cs_bool stopped, alive;
	Mutex *mutex;
	CStore *cfg;
	Thread thread;
	Socket fd;
	AListField *clients;

	struct _LogList {
		cs_uint32 pos, cnt;
		cs_str items[LOGLIST_SIZE];
	} ll;

	cs_uint32 ustates[WSS_MAXVAL];
	cs_byte pwhash[33];
};

extern struct _WebState WebState;
extern EventRegBunch events[];
void genpacket(NetBuffer *nb, cs_str fmt, ...);
void handlewebsockmsg(struct _HttpClient *hc);
TRET WebThread(TARG);
#endif
