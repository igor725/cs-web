#include <core.h>
#include <netbuffer.h>
#include <str.h>
#include <strstor.h>
#include <command.h>
#include <list.h>
#include <world.h>

#include "defines.h"

void genpacket(NetBuffer *nb, cs_str fmt, ...) {
	va_list args;
	va_start(args, fmt);
	cs_int32 tempi, size;
	cs_str temps; cs_float tempf;

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
				if ((temps = va_arg(args, cs_str)) == NULL)
					temps = "(nullptr)";
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
		case 'C': return WSS_CFGEDIT;
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
		genpacket(&hc->nb, List_Next(tmp) ? "ssiiifffii" : "ssiiifffii!",
			World_GetName(world), World_GetTexturePack(world),
			dims.x, dims.y, dims.z, spawn.x, spawn.y, spawn.z,
			World_GetWeather(world), World_IsReadyToPlay(world)
		);
	}
}

static void kickplayer(NetBuffer *nb, ClientID id) {
	Client *cl = Client_GetByID(id);
	if (!cl) {
		genpacket(nb, "NE^s", "Failed to kick specified player");
		return;
	}
	Client_Kick(cl, "Kicked by WebAdmin");
	genpacket(nb, "NI^s", "Player kicked successfully");
}

#ifdef CSWEB_USE_BASE
static void banplayer(NetBuffer *nb, cs_byte **data) {
	if (!WebState.iface_base) return;
	cs_str name = readstr(data);
	/*cs_str reason = */readstr(data);
	/*cs_int32 duration = */readint(data);
	if (WebState.iface_base->banUser(name))
		genpacket(nb, "NI^s", "Player banned successfully");
	else
		genpacket(nb, "NE^s", "Failed to ban specified player");
}

static void opplayer(cs_byte **data) {
	if (!WebState.iface_base) return;
	cs_str name = readstr(data);
	cs_bool state = (cs_bool)readint(data);
	(state ? WebState.iface_base->opUser : WebState.iface_base->deopUser)(name);
}
#endif

static inline cs_bool runcommand(cs_byte *cmd) {
	WL(Info, "Executed a command: %s", cmd);
	return Command_Handle((cs_char *)cmd, NULL);
}

void handlewebsockmsg(struct _HttpClient *hc) {
	cs_byte *data = (cs_byte *)hc->wsh->payload;
	while (hc->state < CHS_CLOSING && (data - (cs_byte *)hc->wsh->payload) < hc->wsh->paylen) {
		if (!hc->cpls->authed) {
			if (*data != 'A') {
				genpacket(&hc->nb, "NE^s", "You need to log in first");
				break;
			}

			if (hc->wsh->paylen == 6 && String_Compare((cs_str)data, "ATEST")) {
				genpacket(&hc->nb, "As", *WebState.pwhash != '\0' ? "REQ" : "OK");
				data += 6;
				break;
			}

			if (hc->wsh->paylen < 34) {
				genpacket(&hc->nb, "NE^s", "Invalid auth packet received");
				data += 34;
				break;
			}

			if ((hc->cpls->authed = Memory_Compare(WebState.pwhash, data + 1, 32)) == true)
				genpacket(&hc->nb, "AOK^ss", ServInf.coreName, ServInf.coreGitTag);
			else genpacket(&hc->nb, "AFAIL^");

			data += 34;
			continue;
		}

		enum _WsState prev = hc->cpls->wsstate;
		switch (*data++) {
			case 'C':
				if (!runcommand((cs_byte *)readstr(&data)))
					genpacket(&hc->nb, "Cs", Sstor_Get("CMD_UNK"));
				break;

			case 'K':
				kickplayer(&hc->nb, (ClientID)readint(&data));
				break;

#ifdef CSWEB_USE_BASE
			case 'B':
				banplayer(&hc->nb, &data);
				break;

			case 'O':
				opplayer(&data);
				break;
#else
			case 'B':
			case 'O':
				genpacket(&hc->nb, "NE^s", "Unsupported action");
				break;
#endif

			case 'S':
				hc->cpls->wsstate = ustate(*readstr(&data));
				if (prev == hc->cpls->wsstate) {
					genpacket(&hc->nb, "NE^s", "You're already here");
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

					case WSS_CFGEDIT:
						break;
					
					case WSS_PLUGINS:
						hc->cpls->time = Time_GetMSecD() + 5.0;
						genpacket(&hc->nb, "NI^s", "Switch state packet will be delivered soon...");
						break;

					default:
					case WSS_MAXVAL:
					case WSS_INVALID:
						hc->state = CHS_CLOSING;
						genpacket(&hc->nb, "NE^s", "Invalid state code received");
						break;
				}
				WL(Debug, "State changed to %d", hc->cpls->wsstate);
				break;

			default:
				genpacket(&hc->nb, "NE^s", "Failed to handle unknown message");
				data += hc->wsh->paylen;
				break;
		}
	}
}
