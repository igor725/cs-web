#include <core.h>
#include <plugin.h>
#include <str.h>

#include "defines.h"

void Plugin_RecvInterface(cs_str name, void *ptr, cs_size size) {
#ifdef CSWEB_USE_BASE
	if (String_Compare(name, BASE_ITF_NAME)) {
		switch (size) {
			case sizeof(BaseItf):
				WebState.iface_base = ptr;
				break;

			case 0U:
				WebState.iface_base = NULL;
				break;

			default:
				WL(Warn, "Failed to bind BaseController interface! Some features like ban, op/deop will be unavailable from WebAdmin");
				break;
		}
	}
#endif
}

void RequestIntefaces(void) {
#	ifdef CSWEB_USE_BASE
#		if BASE_ITF_VERSION > 1
#			warning Unknown base interface version, compiling without the cs-base plugin support
#		else
			Plugin_RequestInterface(Plugin_RecvInterface, BASE_ITF_NAME);
#		endif
#	endif
}
