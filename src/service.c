#include <core.h>
#include <config.h>
#include <log.h>
#include <hash.h>

#include "defines.h"
#include "zipread.h"

static enum _SerResponse serr_start(void) {
	if (WebState.alive) return SERR_ON;

	if (!Config_GetBoolByKey(WebState.cfg, "enabled")) {
		WL(Warn, "You have an WebAdmin plugin installed, but it is disabled. Use \"web enable\" command to run it");
		return SERR_OFF;
	}

	if ((WebState.archive = File_Open("./webdata.zip", "rb")) == NULL) {
		WL(Error, "Failed to open WebAdmin frontend archive: %X", Thread_GetError());
		return SERR_FAIL;
	}

	ZipInfo zi;
	if (!zip_scanfor(WebState.archive, "build/index.html", &zi)) {
		WL(Error, "Index page was not found in the frontent archive");
		goto serrfail;
	}

	cs_str ip = Config_GetStrByKey(WebState.cfg, "ip");
	cs_uint16 port = (cs_uint16)Config_GetIntByKey(WebState.cfg, "port");
	cs_str password = Config_GetStrByKey(WebState.cfg, "password");

	if (*password != '\0') {
		MD5_CTX hash;
		cs_byte final[16];
		if (!MD5_Start(&hash)) {
			WL(Error, "Failed to initialize MD5_CTX struct");
			goto serrfail;
		}
		if (!MD5_PushData(&hash, password, (cs_ulong)String_Length(password))) {
			WL(Error, "Failed to generate password hash");
			goto serrfail;
		}
		if (!MD5_End((void *)&final, &hash)) {
			WL(Error, "Failed to generate password hash");
			goto serrfail;
		}
		static cs_byte hex[] = "0123456789abcdef";
		WebState.pwhash[32] = '\0';
		for (cs_int32 i = 0; i < 16; i++) {
			WebState.pwhash[i * 2 + 0] = hex[(final[i] >> 4) & 0x0F];
			WebState.pwhash[i * 2 + 1] = hex[final[i] & 0x0F];
		}
	}

	WebState.mutex = Mutex_Create();
	WebState.fd = Socket_New();

	struct sockaddr_in ssa;
	if (Socket_SetAddr(&ssa, ip, port) < 0) {
		WL(Error, "Failed to set socket address");
		goto serrfail;
	}

	if (!Socket_SetNonBlocking(WebState.fd, true)) {
		WL(Error, "Failed to set non-blocking socket option");
		goto serrfail;
	}

	if (!Socket_Bind(WebState.fd, &ssa)) {
		WL(Error, "Failed to bind %s:%d", ip, port);
		goto serrfail;
	}

	WebState.alive = true;
	WebState.thread = Thread_Create(WebThread, NULL, false);
	WL(Info, "Listener started on %s:%d", ip, port);
	return SERR_OK;

	serrfail:
	if (WebState.archive) {
		File_Close(WebState.archive);
		WebState.archive = NULL;
	}
	if (WebState.mutex) {
		Mutex_Free(WebState.mutex);
		WebState.mutex = NULL;
	}
	if (WebState.fd != INVALID_SOCKET) {
		Socket_Close(WebState.fd);
		WebState.fd = INVALID_SOCKET;
	}
	return SERR_FAIL;
}

static enum _SerResponse serr_stop(void) {
	if (WebState.alive) {
		WebState.stopped = true;
		Thread_Join(WebState.thread);
		File_Close(WebState.archive);
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
	if (WebState.alive && serr_stop() != SERR_OK) return SERR_FAIL;
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
