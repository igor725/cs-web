#include <core.h>
#include <config.h>
#include <log.h>

#include "defines.h"

static enum _SerResponse serr_start(void) {
	if (WebState.alive) return SERR_ON;

	if (!Config_GetBoolByKey(WebState.cfg, "enabled")) {
		WL(Warn, "You have an WebAdmin plugin installed, but it is disabled. Use \"web enable\" command to run it.");
		return SERR_OFF;
	}

	cs_str ip = Config_GetStrByKey(WebState.cfg, "ip");
	cs_uint16 port = (cs_uint16)Config_GetInt16ByKey(WebState.cfg, "port");
	// cs_str password = Config_GetStrByKey(WebState.cfg, "password");
	String_Copy((cs_char *)WebState.pwhash, 33, "098f6bcd4621d373cade4e832627b4f6");

	WebState.mutex = Mutex_Create();
	WebState.fd = Socket_New();

	struct sockaddr_in ssa;
	if (Socket_SetAddr(&ssa, ip, port) < 0) {
		Socket_Close(WebState.fd);
		WL(Error, "Failed to set socket address");
		return SERR_FAIL;
	}

	if (!Socket_SetNonBlocking(WebState.fd, true)) {
		Socket_Close(WebState.fd);
		WL(Error, "Failed to set non-blocking socket option");
		return SERR_FAIL;
	}

	if (!Socket_Bind(WebState.fd, &ssa)) {
		Socket_Close(WebState.fd);
		WL(Error, "Failed to bind %s:%d", ip, port);
		return SERR_FAIL;
	}

	WebState.alive = true;
	WebState.thread = Thread_Create(WebThread, NULL, false);
	WL(Info, "Listener started on %s:%d", ip, port);
	return SERR_OK;
}

static enum _SerResponse serr_stop(void) {
	if (WebState.alive) {
		WebState.stopped = true;
		Thread_Join(WebState.thread);
		Socket_Close(WebState.fd);
		Mutex_Free(WebState.mutex);
		WebState.alive = false;
		return SERR_OK;
	}

	return SERR_OFF;
}

static enum _SerResponse serr_status(void) {
	return WebState.alive ? SERR_ON : SERR_OFF;
}

static enum _SerResponse serr_enable(cs_bool status) {
	CEntry *en = Config_GetEntry(WebState.cfg, "enabled");
	if (!en) return SERR_FAIL;
	if (Config_GetBool(en) == status)
		return status ? SERR_ON : SERR_OFF;
	Config_SetBool(en, status);
	status ? serr_start() : serr_stop();
	return SERR_OK;
}

static enum _SerResponse serr_reload(void) {
	if (!WebState.alive) return SERR_OFF;
	if (serr_stop() != SERR_OK) return SERR_OFF;
	return serr_start();
}

cs_int32 service(enum _SerCommand sc) {
	switch (sc) {
		case SERC_ENABLE: return serr_enable(true);
		case SERC_DISABLE: return serr_enable(false);
		case SERC_START: return serr_start();
		case SERC_STOP: return serr_stop();
		case SERC_RELOAD: return serr_reload();
		case SERC_STATUS: return serr_status();
		default: return SERR_FAIL;
	}
}
