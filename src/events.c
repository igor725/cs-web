#include <core.h>
#include <event.h>
#include <list.h>
#include <world.h>
#include <client.h>

#include "defines.h"

static void evtpoststart(void *p) {(void)p;
	if (!Config_GetBoolByKey(WebState.cfg, "enabled")) return;
	cs_str ip = Config_GetStrByKey(WebState.cfg, "ip");
	cs_uint16 port = (cs_uint16)Config_GetInt16ByKey(WebState.cfg, "port");
	// cs_str password = Config_GetStrByKey(WebState.cfg, "password");
	String_Copy((cs_char *)WebState.pwhash, 33, "098f6bcd4621d373cade4e832627b4f6");

	WebState.mutex = Mutex_Create();
	WebState.thread = Thread_Create(WebThread, NULL, false);
	WebState.fd = Socket_New();

	struct sockaddr_in ssa;
	if (Socket_SetAddr(&ssa, ip, port) < 0) {
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
		WL(Error, "Failed to bind %s:%d", ip, port);
		return;
	}

	WebState.alive = true;
	WL(Info, "Listener started on %s:%d", ip, port);
}

static void evtonlog(LogBuffer *lb) {
	if (!WebState.alive || lb->flag & LOG_DEBUG) return;

	cs_uint32 cpos = (WebState.ll.pos + WebState.ll.cnt) % LOGLIST_SIZE;
	if (++WebState.ll.cnt > LOGLIST_SIZE) {
		WebState.ll.cnt = LOGLIST_SIZE;
		if (++WebState.ll.pos > (LOGLIST_SIZE - 1))
			WebState.ll.pos = 0;
	}
	if (WebState.ll.items[cpos]) Memory_Free((void *)WebState.ll.items[cpos]);
	WebState.ll.items[cpos] = String_AllocCopy(lb->data);

	if (WebState.clients) {
		AListField *tmp;
		Mutex_Lock(WebState.mutex);
		List_Iter(tmp, WebState.clients) {
			struct _HttpClient *hc = AList_GetValue(tmp).ptr;
			if (!hc->cpls || hc->cpls->wsstate != WSS_CONSOLE) continue;
			String_Copy(hc->cpls->lasttc, 13, lb->data);
			genpacket(&hc->nb, "Cs", lb->data);
		}
		Mutex_Unlock(WebState.mutex);
	}
}

static void evtpreenvupd(preWorldEnvUpdate *pweu) {
	if (WebState.alive && WebState.clients) {
		if ((pweu->values & CPE_WMODVAL_TEXPACK) == 0 &&
			(pweu->values & CPE_WMODVAL_WEATHER) == 0) {
				return;
		}

		AListField *tmp;
		Mutex_Lock(WebState.mutex);
		List_Iter(tmp, WebState.clients) {
			struct _HttpClient *hc = AList_GetValue(tmp).ptr;
			if (!hc->cpls || hc->cpls->wsstate != WSS_HOME) continue;
			if (pweu->values & CPE_WMODVAL_TEXPACK) genpacket(&hc->nb,
				"WT^ss", World_GetName(pweu->world),
				World_GetTexturePack(pweu->world)
			);
			if (pweu->values & CPE_WMODVAL_WEATHER) genpacket(&hc->nb,
				"WW^si", World_GetName(pweu->world),
				World_GetWeather(pweu->world)
			);
		}
		Mutex_Unlock(WebState.mutex);
	}
}

static void evtonwstatus(World *world) {
	if (WebState.alive && WebState.clients) {
		AListField *tmp;
		Mutex_Lock(WebState.mutex);
		List_Iter(tmp, WebState.clients) {
			struct _HttpClient *hc = AList_GetValue(tmp).ptr;
			if (!hc->cpls || hc->cpls->wsstate != WSS_HOME) continue;
			genpacket(&hc->nb, "WS^si", World_GetName(world), World_IsReadyToPlay(world));
		}
		Mutex_Unlock(WebState.mutex);
	}
}

static void evtonhs(onHandshakeDone *ohd) {
	if (WebState.alive && WebState.clients) {
		AListField *tmp;
		Mutex_Lock(WebState.mutex);
		List_Iter(tmp, WebState.clients) {
			struct _HttpClient *hc = AList_GetValue(tmp).ptr;
			if (!hc->cpls || hc->cpls->wsstate != WSS_HOME) continue;
			genpacket(&hc->nb, "PA^isis",
				Client_GetID(ohd->client), Client_GetName(ohd->client),
				Client_IsOP(ohd->client), World_GetName(ohd->world)
			);
		}
		Mutex_Unlock(WebState.mutex);
	}
}

static void evtondisc(Client *client) {
	if (WebState.alive && WebState.clients) {
		AListField *tmp;
		Mutex_Lock(WebState.mutex);
		List_Iter(tmp, WebState.clients) {
			struct _HttpClient *hc = AList_GetValue(tmp).ptr;
			if (!hc->cpls || hc->cpls->wsstate != WSS_HOME) continue;
			genpacket(&hc->nb, "PR^i", Client_GetID(client));
		}
		Mutex_Unlock(WebState.mutex);
	}
}

static void evtonspawn(onSpawn *os) {
	if (WebState.alive && WebState.clients) {
		AListField *tmp;
		Mutex_Lock(WebState.mutex);
		List_Iter(tmp, WebState.clients) {
			struct _HttpClient *hc = AList_GetValue(tmp).ptr;
			if (!hc->cpls || hc->cpls->wsstate != WSS_HOME) continue;
			genpacket(&hc->nb, "PW^is", Client_GetID(os->client), World_GetName(Client_GetWorld(os->client)));
		}
		Mutex_Unlock(WebState.mutex);
	}
}

static void evtonutype(Client *client) {
	if (WebState.alive && WebState.clients) {
		AListField *tmp;
		Mutex_Lock(WebState.mutex);
		List_Iter(tmp, WebState.clients) {
			struct _HttpClient *hc = AList_GetValue(tmp).ptr;
			if (!hc->cpls || hc->cpls->wsstate != WSS_HOME) continue;
			genpacket(&hc->nb, "PO^ii", Client_GetID(client), Client_IsOP(client));
		}
		Mutex_Unlock(WebState.mutex);
	}
}

Event_DeclarePubBunch(events) {
	EVENT_BUNCH_ADD('v', EVT_POSTSTART, evtpoststart),
	EVENT_BUNCH_ADD('v', EVT_ONLOG, evtonlog),
	EVENT_BUNCH_ADD('v', EVT_PREWORLDENVUPDATE, evtpreenvupd),
	EVENT_BUNCH_ADD('v', EVT_ONWORLDSTATUSCHANGE, evtonwstatus),
	EVENT_BUNCH_ADD('v', EVT_ONHANDSHAKEDONE, evtonhs),
	EVENT_BUNCH_ADD('v', EVT_ONDISCONNECT, evtondisc),
	EVENT_BUNCH_ADD('v', EVT_ONSPAWN, evtonspawn),
	EVENT_BUNCH_ADD('v', EVT_ONUSERTYPECHANGE, evtonutype),

	EVENT_BUNCH_END
};
