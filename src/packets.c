#include <core.h>
#include <netbuffer.h>
#include <str.h>
#include <strstor.h>
#include <command.h>
#include <list.h>
#include <world.h>
#include <server.h>
#include <plugin.h>

#include "defines.h"
#ifdef CSWEB_USE_LUA
#	include "cs-lua/src/luaitf.h"
#endif

void genpacket(NetBuffer *nb, cs_str fmt, ...) {
	va_list args;
	va_start(args, fmt);
	cs_int32 tempi, size;
	cs_str temps; cs_float tempf;
	cs_uint64 temp6;

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
			case '6':
				temp6 = va_arg(args, cs_int64);
				if ((size = String_FormatBuf(NULL, 0, "%llu", temp6)) > 0) {
					NetBuffer_EndWrite(nb, String_FormatBuf(
						NetBuffer_StartWrite(nb, size + 1),
						size + 1, "%llu", temp6
					) + 1);
				}
				break;
			case 'f':
				tempf = (cs_float)va_arg(args, cs_double);
				if ((size = String_FormatBuf(NULL, 0, "%f", tempf)) > 0) {
					NetBuffer_EndWrite(nb, String_FormatBuf(
						NetBuffer_StartWrite(nb, size + 1),
						size + 1, "%f", tempf
					) + 1);
				}
				break;
			case 's':
				if ((temps = va_arg(args, cs_str)) == NULL) {
					*NetBuffer_StartWrite(nb, 1) = '\0';
					NetBuffer_EndWrite(nb, 1);
					break;
				}
				size = (cs_int32)(String_Length(temps) + 1);
				NetBuffer_EndWrite(nb, (cs_uint32)String_Copy(NetBuffer_StartWrite(
					nb, (cs_uint32)size), (cs_uint32)size, temps
				) + 1);
				break;

			case '^':
			case '!':
				*NetBuffer_StartWrite(nb, 1) = *fmt == '^' ? '\0' : '\1';
				NetBuffer_EndWrite(nb, 1);
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

static inline enum _WsState ustate(cs_char s) {
	switch (s) {
		case 'H': return WSS_HOME;
		case 'R': return WSS_CONSOLE;
		case 'E': return WSS_PLUGINS;
		default:  return WSS_INVALID;
	}
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
/*
static cs_uint32 readargc(cs_byte *data, cs_uint16 len) {
	cs_uint32 argc = 0;
	for (; len > 1; len--)
		if (*data++ == '\0') argc++;
	return argc;
}
*/

static void sendconsolestate(struct _HttpClient *hc) {
	cs_uint32 end = WebState.ll.pos + WebState.ll.cnt,
	pos = WebState.ll.pos;
	cs_char *lasttc = hc->cpls->lasttc;
	cs_str *items = WebState.ll.items;
	cs_int32 diff = -1;

	for (cs_uint32 i = pos; *lasttc != '\0' && i < end; i++) {
		if (String_CaselessCompare2(items[i % LOGLIST_SIZE], lasttc, 12))
			diff = i - pos;
	}

	if (diff > 0) {
		pos += diff + 1;
		if (pos >= end)
			pos = end;
	}

	cs_uint32 cnt = end - pos;
	genpacket(&hc->nb, "SR^i", cnt);
	if (cnt < 1) return;

	for (cs_uint32 i = pos; i < end; i++) {
		cs_str line = WebState.ll.items[i % LOGLIST_SIZE];
		cs_uint32 linelen = (cs_uint32)String_Length(line) + 1;
		String_Copy(NetBuffer_StartWrite(&hc->nb, linelen), linelen, line);
		NetBuffer_EndWrite(&hc->nb, linelen);
	}

	String_Copy(lasttc, 13, items[min((end % LOGLIST_SIZE) - 1, LOGLIST_SIZE - 1)]);
}

static void sendhomestate(struct _HttpClient *hc) {
	genpacket(&hc->nb, "SH^");

	for (ClientID i = 0; i < MAX_CLIENTS; i++) {
		Client *client = Clients_List[i];
		if (!client) continue;
		genpacket(&hc->nb, "isis", i, Client_GetName(client),
			Client_IsOP(client), World_GetName(Client_GetWorld(client))
		);
	}

	AListField *tmp;
	genpacket(&hc->nb, "!");
	List_Iter(tmp, World_Head) {
		World *world = AList_GetValue(tmp).ptr;
		SVec dims; World_GetDimensions(world, &dims);
		Vec spawn; World_GetSpawn(world, &spawn, NULL);
		genpacket(&hc->nb, List_Next(tmp) ? "ssiiifffii" : "ssiiifffii!^",
			World_GetName(world), World_GetTexturePack(world),
			dims.x, dims.y, dims.z, spawn.x, spawn.y, spawn.z,
			World_GetWeather(world), World_IsReadyToPlay(world)
		);
	}
	genpacket(&hc->nb, "6", WebState.usagemem);
}

static void sendpluginsstate(struct _HttpClient *hc) {
	genpacket(&hc->nb, "SE^");

	PluginInfo pi;
	cs_uint32 index = 0;
	while ((index = Plugin_RequestInfo(&pi, index)) != 0) {
		genpacket(&hc->nb, "iiss", pi.id, pi.version, pi.name, pi.home);
		Plugin_DiscardInfo(&pi);
	}

#ifdef CSWEB_USE_LUA
	LuaItf *lif = WebState.iface_lua;
	genpacket(&hc->nb, "!");
	if (lif) {
		LuaInfo li;
		index = 0;
		while ((index = lif->requestScriptInfo(&li, index)) != 0) {
			genpacket(&hc->nb, "iiiss", li.id, li.version,
				li.hotreload, li.name, li.home
			);
			lif->discardScriptInfo(&li);
		}
	}

	genpacket(&hc->nb, "!^");
#else
	genpacket(&hc->nb, "!!^");
#endif
}

static inline void sendinfo(NetBuffer *nb, cs_str str) {
	genpacket(nb, "NI^s", str);
}

static inline void senderror(NetBuffer *nb, cs_str str) {
	genpacket(nb, "NE^s", str);
}

static inline void sendwarn(NetBuffer *nb, cs_str str) {
	genpacket(nb, "NW^s", str);
}

static void kickplayer(NetBuffer *nb, ClientID id) {
	Client *cl = Client_GetByID(id);
	if (!cl) {
		senderror(nb, "Failed to kick specified player");
		return;
	}
	Client_Kick(cl, "Kicked by WebAdmin");
	sendinfo(nb, "Player kicked successfully");
}

#ifdef CSWEB_USE_BASE
static cs_bool checkbase(NetBuffer *nb) {
	if (WebState.iface_base) return true;
	senderror(nb, "Base plugin is not installed on the server");
	return false;
}

static void banplayer(NetBuffer *nb, cs_byte **data) {
	cs_str name = readstr(data);
	/*cs_str reason = */readstr(data);
	/*cs_int32 duration = */readint(data);
	if (!checkbase(nb)) return;
	if (WebState.iface_base->banUser(name))
		sendinfo(nb, "Player banned successfully");
	else
		senderror(nb, "Failed to ban specified player");
}

static void opplayer(NetBuffer *nb, cs_byte **data) {
	cs_str name = readstr(data);
	cs_bool state = (cs_bool)readint(data);
	if (!checkbase(nb)) return;
	(state ? WebState.iface_base->opUser : WebState.iface_base->deopUser)(name);
}
#else
static void banplayer(NetBuffer *nb, cs_byte **data) {
	readstr(data);readstr(data);readint(data);
	senderror(nb, "The backend plugin was compiled without the base plugin integration");
}

static void opplayer(NetBuffer *nb, cs_byte **data) {
	cs_str name = readstr(data);
	cs_bool state = (cs_bool)readint(data);
	Client *client = Client_GetByName(name);
	if (!client) {
		senderror(nb, "Specified player not found");
		return;
	}
	Client_SetOP(client, state);
}
#endif

static inline cs_bool runcommand(cs_byte *cmd) {
	WL(Info, "Executed a command: %s", cmd);
	return Command_Handle((cs_char *)cmd, NULL);
}

static inline void setweather(NetBuffer *nb, cs_byte **data) {
	World *world = World_GetByName(readstr(data));
	EWeather ww = (EWeather)readint(data);
	if (!world) {
		senderror(nb, "Specified world not found");
		return;
	}
	if (!World_SetWeather(world, ww)) {
		senderror(nb, "Invalid weather type specified");
		return;
	}
	World_FinishEnvUpdate(world);
}

#ifdef CSWEB_USE_LUA
static cs_bool unloadluascript(cs_uint32 id, cs_bool force) {
	LuaItf *lif = WebState.iface_lua;
	return lif && lif->runScriptCommand(force ? LUACOMMAND_FORCEUNLOAD : LUACOMMAND_UNLOAD, id);
}

static cs_bool reloadluascript(cs_uint32 id) {
	LuaItf *lif = WebState.iface_lua;
	return lif && lif->runScriptCommand(LUACOMMAND_RELOAD, id);
}
#endif

static inline void handleextcommand(NetBuffer *nb, cs_byte **data) {
	cs_str cmd = readstr(data);
	cs_uint32 ptype = readint(data);
	cs_uint32 id = readint(data);
	cs_bool force = readint(data) > 0;
	PluginInfo pi;

	switch (ptype) {
		case 0 /*Native*/:
			if (Plugin_RequestInfo(&pi, id)) {
				if (!Plugin_PerformUnload(pi.name, *cmd == 'D')) {
					senderror(nb, "Failed to unload spefcified plugin");
					return;
				}

				return;
			} else {
				senderror(nb, "Specified plugin is not loaded");
				return;
			}
#ifdef CSWEB_USE_LUA
		case 1 /*Lua*/:
			switch (*cmd) {
				case 'U' /*Unload*/:
					if (unloadluascript(id, force))
						return;
				case 'D' /*Reload*/:
					if (reloadluascript(id))
						return;
			}
			break;
#endif
	}
	senderror(nb, "Invalid extension command received");
}

static void sendauthok(NetBuffer *nb) {
	cs_int16 maxplayers = 0;
	CEntry *ent;
	if ((ent = Config_GetEntry(Server_Config, CFG_MAXPLAYERS_KEY)) != NULL)
		maxplayers = (cs_int16)Config_GetInt(ent);

	genpacket(nb, "AOK^ss6ii6",
		ServInf.coreName, ServInf.coreGitTag,
		Server_StartTime, maxplayers, WebState.self,
		WebState.totalmem
	);
}

void handlewebsockmsg(struct _HttpClient *hc) {
	cs_byte *data = (cs_byte *)hc->wsh->payload;
	while (hc->state < CHS_CLOSING && (data - (cs_byte *)hc->wsh->payload) < hc->wsh->paylen) {
		if (!hc->cpls->authed) {
			if (*data != 'A') {
				senderror(&hc->nb, "You need to log in first");
				break;
			}

			switch (hc->wsh->paylen) {
				case 6:
					if (Memory_Compare(data, (void *)"ATEST", 6)) {
						if ((hc->cpls->authed = (*WebState.pwhash == '\0')) == false) {
							genpacket(&hc->nb, "AREQ^");
							data += 6;
							continue;
						}

						sendwarn(&hc->nb, "Using WebAdmin without a password set is dangerous!\n"
							"We recommend you to set a password using this command:\n"
							"\"web set password <desiredpassword>\""
						);
					}
					break;
				case 34:
					hc->cpls->authed = *WebState.pwhash == '\0' ||
						Memory_Compare(WebState.pwhash, data + 1, 32);
					break;
			}

			data += hc->wsh->paylen;
			if (hc->cpls->authed)
				sendauthok(&hc->nb);
			else
				genpacket(&hc->nb, "AFAIL^");

			continue;
		}

		enum _WsState prev = hc->cpls->wsstate;
		switch (*data++) {
			case 'B':
				banplayer(&hc->nb, &data);
				break;

			case 'C':
				if (!runcommand((cs_byte *)readstr(&data)))
					genpacket(&hc->nb, "Cs", Sstor_Get("CMD_UNK"));
				break;

			case 'E':
				handleextcommand(&hc->nb, &data);
				break;

			case 'K':
				kickplayer(&hc->nb, (ClientID)readint(&data));
				break;

			case 'O':
				opplayer(&hc->nb, &data);
				break;

			case 'S':
				hc->cpls->wsstate = ustate(*readstr(&data));
				if (prev == hc->cpls->wsstate) {
					senderror(&hc->nb, "You're already here");
					break;
				}
				WebState.ustates[prev]--;
				if (hc->cpls->wsstate == WSS_INVALID) {
					hc->state = CHS_CLOSING;
					break;
				}
				WebState.ustates[hc->cpls->wsstate]++;
				switch (hc->cpls->wsstate) {
					case WSS_HOME:
						sendhomestate(hc);
						break;

					case WSS_CONSOLE:
						sendconsolestate(hc);
						break;

					case WSS_PLUGINS:
						sendpluginsstate(hc);
						break;

					default:
					case WSS_MAXVAL:
					case WSS_INVALID:
						hc->state = CHS_CLOSING;
						senderror(&hc->nb, "Invalid state code received");
						break;
				}
				WL(Debug, "State changed to %d", hc->cpls->wsstate);
				break;

			case 'W':
				setweather(&hc->nb, &data);
				break;

			default:
				senderror(&hc->nb, "Failed to handle unknown message");
				data += hc->wsh->paylen;
				break;
		}
	}
}
