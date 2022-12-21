#include <core.h>
#include <websock.h>
#include <platform.h>
#include <netbuffer.h>
#include <command.h>
#include <config.h>
#include <server.h>
#include <plugin.h>

#include "defines.h"

Plugin_SetVersion(1);
#if PLUGIN_API_NUM > 1
Plugin_SetURL("https://github.com/igor725/cs-web");
#endif

ServerInfo ServInf = {0};

struct _WebState WebState = {
	.totalmem = (cs_uint64)-1,
	.stopped = false,
	.alive = false,
	.clients = NULL,
	.ll = {
		.pos = 0, .cnt = 0, .items = {NULL}
	}
};

#if defined(CORE_USE_DARWIN)
#	include <sys/types.h>
#	include <sys/sysctl.h>
#elif defined(CORE_USE_UNIX)
#	include <sys/sysinfo.h>
#endif

cs_bool Plugin_LoadEx(cs_uint32 id) {
	if (!Server_GetInfo(&ServInf, sizeof(ServInf))) {
		WL(Warn, "Failed to get server version info");
		ServInf.coreGitTag = "unknown";
		ServInf.coreName = "unnamed";
		ServInf.coreFlags = 0;
	}

	WebState.self = id;
	WebState.cfg = Config_NewStore("web");
#if defined(CORE_USE_WINDOWS)
	if (GetPhysicallyInstalledSystemMemory(&WebState.totalmem))
		WebState.totalmem /= 1024;
#elif defined(CORE_USE_DARWIN)
	cs_int32 si[] = {CTL_HW, HW_MEMSIZE};
	cs_size len = sizeof(WebState.totalmem);
	if (sysctl(si, 2, &WebState.totalmem, &len, NULL, 0) == 0)
		WebState.totalmem /= 1024 * 1024;
#elif defined(CORE_USE_UNIX)
	struct sysinfo si;
	if (sysinfo(&si) == 0)
		WebState.totalmem = (si.totalram * si.mem_unit) / (1024 * 1024);
#endif

	CEntry *ent;
	ent = Config_NewEntry(WebState.cfg, "enabled", CONFIG_TYPE_BOOL);
	Config_SetComment(ent, "Enable web admin");
	Config_SetDefaultBool(ent, false);

	ent = Config_NewEntry(WebState.cfg, "ip", CONFIG_TYPE_STR);
	Config_SetComment(ent, "WebAdmin service ip (0.0.0.0 means \"all available network adapters\")");
	Config_SetDefaultStr(ent, "0.0.0.0");

	ent = Config_NewEntry(WebState.cfg, "port", CONFIG_TYPE_INT);
	Config_SetComment(ent, "WebAdmin service port");
	Config_SetLimit(ent, 0, 65535);
	Config_SetDefaultInt(ent, 8888);

	ent = Config_NewEntry(WebState.cfg, "password", CONFIG_TYPE_STR);
	Config_SetComment(ent, "WebAdmin password (empty means no password required)");
	Config_SetDefaultStr(ent, "");

	if (!Config_Load(WebState.cfg)) {
		WL(Error, "Failed to parse config file, resetting to default values");
		Config_ResetToDefault(WebState.cfg);
		Config_Save(WebState.cfg, true);
	}

	RequestIntefaces();
	return Event_RegisterBunch(events) &&
	Command_RegisterBunch(cmds);
}

cs_bool Plugin_Unload(cs_bool force) {
	if (!force) return false;
	Config_Save(WebState.cfg, false);
	Config_DestroyStore(WebState.cfg);
	Event_UnregisterBunch(events);
	Command_UnregisterBunch(cmds);
	service(SERC_STOP);
	return true;
}
