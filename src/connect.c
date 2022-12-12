#include <core.h>
#include <plugin.h>
#include <str.h>

#include "defines.h"

#if defined(CSWEB_USE_BASE) || defined(CSWEB_USE_LUA)
void Plugin_RecvInterface(cs_str name, void *ptr, cs_size size) {
#	ifdef CSWEB_USE_BASE
		if (String_Compare(name, CSBASE_ITF_NAME)) {
			switch (size) {
				case sizeof(BaseItf):
					WebState.iface_base = ptr;
					return;

				case 0U:
					WebState.iface_base = NULL;
					return;

				default:
					WL(Warn, "Failed to bind BaseController interface! Some features like ban, op/deop will be unavailable from WebAdmin");
					return;
			}
		}
#	endif

#	ifdef CSWEB_USE_LUA
		if (String_Compare(name, CSLUA_ITF_NAME)) {
			switch (size) {
				case sizeof(LuaItf):
					WebState.iface_lua = ptr;
					WebState.iface_lua->addCallback(luaeventcallback);
					return;

				case 0U:
					WebState.iface_lua = NULL;
					return;

				default:
					WL(Warn, "Failed to bind LuaController interface! Some features like script management will be unavailable from WebAdmin");
					return;
			}
		}
#	endif
}
#endif

void RequestIntefaces(void) {
#	ifdef CSWEB_USE_BASE
#		if BASE_ITF_VERSION > 1
#			warning Unknown base interface version, compiling without the cs-base plugin support
#		else
			Plugin_RequestInterface(Plugin_RecvInterface, CSBASE_ITF_NAME);
#		endif
#	endif

#	ifdef CSWEB_USE_LUA
	Plugin_RequestInterface(Plugin_RecvInterface, CSLUA_ITF_NAME);
#endif
}
