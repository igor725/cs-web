#include <core.h>
#include <websock.h>
#include <platform.h>
#include <netbuffer.h>
#include <config.h>

#include "plhdr.h"
#include "defines.h"

struct _WebState WebState = {
	.stopped = false,
	.alive = false,
	.clients = NULL,
	.ll = {
		.pos = 0, .cnt = 0, .items = {NULL}
	}
};

cs_bool Plugin_Load(void) {
	WebState.cfg = Config_NewStore("web");

	CEntry *ent;
	ent = Config_NewEntry(WebState.cfg, "enabled", CONFIG_TYPE_BOOL);
	Config_SetComment(ent, "Enable web admin");
	Config_SetDefaultBool(ent, false);

	ent = Config_NewEntry(WebState.cfg, "ip", CONFIG_TYPE_STR);
	Config_SetComment(ent, "WebAdmin service ip (0.0.0.0 means \"all available network adapters\")");
	Config_SetDefaultStr(ent, "0.0.0.0");

	ent = Config_NewEntry(WebState.cfg, "port", CONFIG_TYPE_INT16);
	Config_SetComment(ent, "WebAdmin service port");
	Config_SetDefaultInt16(ent, 8888);

	ent = Config_NewEntry(WebState.cfg, "password", CONFIG_TYPE_STR);
	Config_SetComment(ent, "WebAdmin password (empty means no password required)");
	Config_SetDefaultStr(ent, "");

	if (!Config_Load(WebState.cfg)) {
		WL(Error, "Failed to parse config file, resetting to default values");
		Config_ResetToDefault(WebState.cfg);
		Config_Save(WebState.cfg, true);
	}

	return Event_RegisterBunch(events);
}

cs_bool Plugin_Unload(cs_bool force) {(void)force;
	Config_Save(WebState.cfg, false);
	Config_DestroyStore(WebState.cfg);
	Event_UnregisterBunch(events);

	if (WebState.alive) {
		WebState.stopped = true;
		Thread_Join(WebState.thread);
		Socket_Close(WebState.fd);
		Mutex_Free(WebState.mutex);
	}

	return true;
}
