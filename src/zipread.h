#ifndef CSWEB_ZIPREAD_H
#define CSWEB_ZIPREAD_H
#include <core.h>
#include <platform.h>

typedef struct _ZipInfo {
	cs_uint32 offset;
	cs_uint32 usize, csize;
	cs_bool compressed;
	enum _Error {
		ZI_OK,
		ZI_IO,
		ZI_HDR,
		ZI_UNS,
		ZI_CORR,
		ZI_ALLOC,

		ZI_MAXINT = 0xFFFFFFFF
	} error;
} ZipInfo;

cs_bool zip_scanfor(cs_file zf, cs_str searchfor, ZipInfo *zi);
#endif
