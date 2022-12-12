#include <core.h>
#include <event.h>
#include <list.h>
#include <world.h>
#include <client.h>
#include <plugin.h>

#include "defines.h"

static void evtpoststart(void *p) {(void)p;
	service(SERC_START);
}

static void evtonlog(LogBuffer *lb) {
	if (lb->flag & LOG_DEBUG) return;

	cs_uint32 cpos = (WebState.ll.pos + WebState.ll.cnt) % LOGLIST_SIZE;
	if (++WebState.ll.cnt > LOGLIST_SIZE) {
		WebState.ll.cnt = LOGLIST_SIZE;
		if (++WebState.ll.pos > (LOGLIST_SIZE - 1))
			WebState.ll.pos = 0;
	}
	if (WebState.ll.items[cpos]) Memory_Free((void *)WebState.ll.items[cpos]);
	WebState.ll.items[cpos] = String_AllocCopy(lb->data);

	if (WebState.alive && WebState.clients) {
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

static void evtonwadd(World *world) {
	if (WebState.alive && WebState.clients) {
		AListField *tmp;
		Mutex_Lock(WebState.mutex);
		cs_str wname = World_GetName(world),
		wtex = World_GetTexturePack(world);
		SVec wdims; World_GetDimensions(world, &wdims);
		Vec wspawn; World_GetSpawn(world, &wspawn, NULL);
		EWeather ww = World_GetWeather(world);
		cs_bool wr = World_IsReadyToPlay(world);

		List_Iter(tmp, WebState.clients) {
			struct _HttpClient *hc = AList_GetValue(tmp).ptr;
			if (!hc->cpls || hc->cpls->wsstate != WSS_HOME) continue;
			genpacket(&hc->nb, "WA^ssiiifffii",
				wname, wtex, wdims.x, wdims.y, wdims.z,
				wspawn.x, wspawn.y, wspawn.z, ww, wr);
		}
		Mutex_Unlock(WebState.mutex);
	}
}

static void evtonwrem(World *world) {
	if (WebState.alive && WebState.clients) {
		AListField *tmp;
		Mutex_Lock(WebState.mutex);
		cs_str wname = World_GetName(world);

		List_Iter(tmp, WebState.clients) {
			struct _HttpClient *hc = AList_GetValue(tmp).ptr;
			if (!hc->cpls || hc->cpls->wsstate != WSS_HOME) continue;
			genpacket(&hc->nb, "WR^s", wname);
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
		cs_str wname = World_GetName(pweu->world),
		wtex = World_GetTexturePack(pweu->world);
		EWeather ww = World_GetWeather(pweu->world);

		List_Iter(tmp, WebState.clients) {
			struct _HttpClient *hc = AList_GetValue(tmp).ptr;
			if (!hc->cpls || hc->cpls->wsstate != WSS_HOME) continue;
			if (pweu->values & CPE_WMODVAL_TEXPACK) genpacket(&hc->nb, "WT^ss", wname, wtex);
			if (pweu->values & CPE_WMODVAL_WEATHER) genpacket(&hc->nb, "WW^si", wname, ww);
		}
		Mutex_Unlock(WebState.mutex);
	}
}

static void evtonwstatus(World *world) {
	if (WebState.alive && WebState.clients) {
		AListField *tmp;
		Mutex_Lock(WebState.mutex);
		cs_str wname = World_GetName(world);
		cs_bool wr = World_IsReadyToPlay(world);

		List_Iter(tmp, WebState.clients) {
			struct _HttpClient *hc = AList_GetValue(tmp).ptr;
			if (!hc->cpls || hc->cpls->wsstate != WSS_HOME) continue;
			genpacket(&hc->nb, "WS^si", wname, wr);
		}
		Mutex_Unlock(WebState.mutex);
	}
}

static void evtonhs(onHandshakeDone *ohd) {
	if (WebState.alive && WebState.clients) {
		AListField *tmp;
		Mutex_Lock(WebState.mutex);
		ClientID cid = Client_GetID(ohd->client);
		cs_str cname = Client_GetName(ohd->client),
		cworld = World_GetName(ohd->world);
		cs_bool cop = Client_IsOP(ohd->client);

		List_Iter(tmp, WebState.clients) {
			struct _HttpClient *hc = AList_GetValue(tmp).ptr;
			if (!hc->cpls || hc->cpls->wsstate != WSS_HOME) continue;
			genpacket(&hc->nb, "PA^isis", cid, cname, cop, cworld);
		}
		Mutex_Unlock(WebState.mutex);
	}
}

static void evtondisc(Client *client) {
	if (WebState.alive && WebState.clients) {
		AListField *tmp;
		Mutex_Lock(WebState.mutex);
		ClientID cid = Client_GetID(client);

		List_Iter(tmp, WebState.clients) {
			struct _HttpClient *hc = AList_GetValue(tmp).ptr;
			if (!hc->cpls || hc->cpls->wsstate != WSS_HOME) continue;
			genpacket(&hc->nb, "PR^i", cid);
		}
		Mutex_Unlock(WebState.mutex);
	}
}

static void evtonspawn(onSpawn *os) {
	if (WebState.alive && WebState.clients) {
		AListField *tmp;
		Mutex_Lock(WebState.mutex);
		ClientID cid = Client_GetID(os->client);
		cs_str cworld = World_GetName(Client_GetWorld(os->client));

		List_Iter(tmp, WebState.clients) {
			struct _HttpClient *hc = AList_GetValue(tmp).ptr;
			if (!hc->cpls || hc->cpls->wsstate != WSS_HOME) continue;
			genpacket(&hc->nb, "PW^is", cid, cworld);
		}
		Mutex_Unlock(WebState.mutex);
	}
}

static void evtonutype(Client *client) {
	if (WebState.alive && WebState.clients) {
		AListField *tmp;
		Mutex_Lock(WebState.mutex);
		ClientID cid = Client_GetID(client);
		cs_bool cop = Client_IsOP(client);

		List_Iter(tmp, WebState.clients) {
			struct _HttpClient *hc = AList_GetValue(tmp).ptr;
			if (!hc->cpls || hc->cpls->wsstate != WSS_HOME) continue;
			genpacket(&hc->nb, "PO^ii", cid, cop);
		}
		Mutex_Unlock(WebState.mutex);
	}
}

static void evtplugload(PluginInfo *pi) {
	if (WebState.alive && WebState.clients) {
		AListField *tmp;
		Mutex_Lock(WebState.mutex);

		List_Iter(tmp, WebState.clients) {
			struct _HttpClient *hc = AList_GetValue(tmp).ptr;
			if (!hc->cpls || hc->cpls->wsstate != WSS_PLUGINS) continue;
			genpacket(&hc->nb, "EA^0^iiss", pi->id, pi->version, pi->name, pi->home);
		}
		Mutex_Unlock(WebState.mutex);
	}
}

static void evtplugunload(cs_uint32 *id) {
	if (WebState.alive && WebState.clients) {
		AListField *tmp;
		Mutex_Lock(WebState.mutex);

		List_Iter(tmp, WebState.clients) {
			struct _HttpClient *hc = AList_GetValue(tmp).ptr;
			if (!hc->cpls || hc->cpls->wsstate != WSS_PLUGINS) continue;
			genpacket(&hc->nb, "ER^0^i", *id);
		}
		Mutex_Unlock(WebState.mutex);
	}
}

Event_DeclarePubBunch(events) {
	EVENT_BUNCH_ADD('v', EVT_POSTSTART, evtpoststart),
	EVENT_BUNCH_ADD('v', EVT_ONLOG, evtonlog),
	EVENT_BUNCH_ADD('v', EVT_ONWORLDADDED, evtonwadd),
	EVENT_BUNCH_ADD('v', EVT_ONWORLDREMOVED, evtonwrem),
	EVENT_BUNCH_ADD('v', EVT_PREWORLDENVUPDATE, evtpreenvupd),
	EVENT_BUNCH_ADD('v', EVT_ONWORLDSTATUSCHANGE, evtonwstatus),
	EVENT_BUNCH_ADD('v', EVT_ONHANDSHAKEDONE, evtonhs),
	EVENT_BUNCH_ADD('v', EVT_ONDISCONNECT, evtondisc),
	EVENT_BUNCH_ADD('v', EVT_ONSPAWN, evtonspawn),
	EVENT_BUNCH_ADD('v', EVT_ONUSERTYPECHANGE, evtonutype),
	EVENT_BUNCH_ADD('v', EVT_ONPLUGINLOAD, evtplugload),
	EVENT_BUNCH_ADD('v', EVT_ONPLUGINUNLOAD, evtplugunload),

	EVENT_BUNCH_END
};

#ifdef CSWEB_USE_LUA
static void evtluascriptadd(const LuaInfo *li) {
	if (WebState.alive && WebState.clients) {
		AListField *tmp;
		Mutex_Lock(WebState.mutex);

		List_Iter(tmp, WebState.clients) {
			struct _HttpClient *hc = AList_GetValue(tmp).ptr;
			if (!hc->cpls || hc->cpls->wsstate != WSS_PLUGINS) continue;
			genpacket(&hc->nb, "EA^1^iiiss", li->id, li->version, li->hotreload, li->name, li->home);
		}
		Mutex_Unlock(WebState.mutex);
	}
}

static void evtluascriptremove(cs_uint32 id) {
	if (WebState.alive && WebState.clients) {
		AListField *tmp;
		Mutex_Lock(WebState.mutex);

		List_Iter(tmp, WebState.clients) {
			struct _HttpClient *hc = AList_GetValue(tmp).ptr;
			if (!hc->cpls || hc->cpls->wsstate != WSS_PLUGINS) continue;
			genpacket(&hc->nb, "ER^1^i", id);
		}
		Mutex_Unlock(WebState.mutex);
	}
}

void luaeventcallback(ELuaEvent type, const void *ptr) {
	switch (type) {
		case LUAEVENT_UPDATEINFO:
		case LUAEVENT_ADDSCRIPT:
			evtluascriptadd(ptr);
			break;
		case LUAEVENT_REMOVESCRIPT:
			evtluascriptremove(*(cs_uint32 *)ptr);
			break;
	}
}
#endif
