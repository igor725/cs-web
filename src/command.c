#include <core.h>
#include <command.h>

#include "defines.h"

cs_str const unk_err = "Failed to %s web service",
alr_str = "Web service is already %s",
succ_str = "Web service is successfully %s";

COMMAND_FUNC(Web) {
	COMMAND_SETUSAGE("/Web <enable/disable/reload/status/set> [option] [value]");
	cs_char temparg[32];

	if (COMMAND_GETARG(temparg, 32, 0)) {
		if (String_CaselessCompare(temparg, "enable")) {
			switch (service(SERC_ENABLE)) {
				case SERR_ON: COMMAND_PRINTF(alr_str, "&eenabled&f");
				case SERR_OK: COMMAND_PRINTF(succ_str, "&aenabled&f");
				default: COMMAND_PRINTF(unk_err, "&aenable&f");
			}
		} else if (String_CaselessCompare(temparg, "disable")) {
			switch (service(SERC_DISABLE)) {
				case SERR_OFF: COMMAND_PRINTF(alr_str, "&cdisabled&f");
				case SERR_OK: COMMAND_PRINTF(succ_str, "&cdisabled&f");
				default: COMMAND_PRINTF(unk_err, "&adisable&f");
			}
		} else if (String_CaselessCompare(temparg, "reload")) {
			switch (service(SERC_RELOAD)) {
				case SERR_OK: COMMAND_PRINTF(succ_str, "&ereloaded&f");
				case SERR_OFF: COMMAND_PRINT("Web service is &cstopped&f");
				default: COMMAND_PRINTF(unk_err, "&ereload&f");
			}
		} else if (String_CaselessCompare(temparg, "set")) {
			if (COMMAND_GETARG(temparg, 32, 1)) {
				CEntry *ent = Config_GetEntry(WebState.cfg, temparg);
				if (!ent) COMMAND_PRINT("Invalid config entry specified");
				if (COMMAND_GETARG(temparg, 32, 2)) {
					Config_SetGeneric(ent, temparg); Config_Parse(ent, temparg, 32);
					COMMAND_PRINTF("The \"%s\" value will be changed to \"%s\" after reloading", Config_GetEntryKey(ent), temparg);
				}
			}
		} else if (String_CaselessCompare(temparg, "status"))
			COMMAND_PRINTF("Web service is %s", service(SERC_STATUS) == SERR_ON ? "&aON" : "&cOFF");
	}

	COMMAND_PRINTUSAGE;
}

Command_DeclarePubBunch(cmds) {
	COMMAND_BUNCH_ADD(Web, CMDF_OP, "WebAdmin management"),

	COMMAND_BUNCH_END
};
