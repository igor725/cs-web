#include <core.h>
#include <platform.h>
#include <str.h>
#include "zipread.h"


cs_bool zip_scanfor(cs_file zf, cs_str searchfor, ZipInfo *zi) {
#	define ZREAD(p) if (File_Read(&(p), sizeof(p), 1, zf) != 1) goto zioerr
	if (*searchfor == '.' && *(searchfor + 1) == '/') searchfor += 2;

	File_Seek(zf, 0, SEEK_SET);
	cs_char *nameptr;
	cs_uint16 namelen;
	cs_uint16 tmp16;

	while (!File_IsEnd(zf)) {
		cs_uint32 header;
		ZREAD(header);

		switch (header) {
			case 0x04034b50: // Local File Header
				// Версия компрессора
				ZREAD(tmp16);
				if (tmp16 > 20) {
					zi->error = ZI_UNS;
					return false;
				}
				// Флаги обрабатывать лень, да и не нужны они в общем-то
				ZREAD(tmp16);
				if (tmp16 > 0) {
					zi->error = ZI_UNS;
					return false;
				}
				// Мы могём только в deflate
				ZREAD(tmp16);
				if ((zi->compressed = (tmp16 != 0x0000)) != false && tmp16 != 0x0008) {
					zi->error = ZI_UNS;
					return false;
				}
				File_Seek(zf, 8, SEEK_CUR); // Пропускаем 8 байт (время модификации и crc32)
				ZREAD(zi->csize); // Читаем размер сжатых данных
				ZREAD(zi->usize); // Читаем размер несжатых данных
				ZREAD(namelen); // Читаем размер имени файла
				if (namelen == 0) { // Такого явно быть не должно
					zi->error = ZI_CORR;
					return false;
				}
				if ((nameptr = Memory_TryAlloc(namelen, sizeof(cs_char))) == NULL) {
					zi->error = ZI_ALLOC;
					return false;
				}
				ZREAD(tmp16); // Размер extra-поля
				if (File_Read(nameptr, namelen, 1, zf) != 1) {
					zi->error = ZI_IO;
					return 0UL;
				}
				if (tmp16 > 0) File_Seek(zf, tmp16, SEEK_CUR); // Пропускаем extra-поле
				if (String_CaselessCompare(nameptr, searchfor)) {
					Memory_Free(nameptr);
					zi->offset = (cs_uint32)File_Seek(zf, 0, SEEK_CUR);
					return true;
				}
				Memory_Free(nameptr);
				File_Seek(zf, zi->csize, SEEK_CUR);
				break;

			default:
				return 0UL;
		}
	}

	zioerr:
	zi->error = ZI_IO;
	return false;
}

