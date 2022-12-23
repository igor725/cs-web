SET CFLAGS=!CFLAGS! /I../
SET CSWEB_BUILD_FRONTEND=0

FOR %%a IN (%PLUGIN_ARGS%) DO (
	IF "%%a"=="wbuild" SET CSWEB_BUILD_FRONTEND=1
)

IF EXIST "..\cs-base\src\base_itf.h" (
	SET CFLAGS=!CFLAGS! /DCSWEB_USE_BASE
)

IF EXIST "..\cs-lua\src\luaitf.h" (
	SET CFLAGS=!CFLAGS! /DCSWEB_USE_LUA
	SET CSSCRIPTS_ONLY_INCLUDES=1
	CALL ..\cs-lua\vars.bat
)

IF "%CSWEB_BUILD_FRONTEND%"=="1" (
	WHERE npm >nul 2>nul
	IF NOT "!ERRORLEVEL!"=="0" (
		SET NF_NAME=NodeJS
		GOTO notfound
	)
	WHERE 7z >nul 2>nul
	IF NOT "!ERRORLEVEL!"=="0" (
		SET NF_NAME=7Z
		GOTO notfound
	)

	PUSHD %ROOT%\websource
	CALL npm install && CALL npm run build
	IF NOT "!ERRORLEVEL!"=="0" (
		POPD
		ECHO Failed to build webdata
		EXIT /B 1
	)
	POPD
	IF "%PLUGIN_INSTALL%"=="1" (
		SET PLUGIN_INSTALL_PATH=%SERVER_OUTROOT%\webdata.zip
	) ELSE (
		SET PLUGIN_INSTALL_PATH=%OUTDIR%\webdata.zip
	)

	DEL !PLUGIN_INSTALL_PATH! 2> nul
	7z a -tzip -sdel !PLUGIN_INSTALL_PATH! %ROOT%\websource\build
)

EXIT /B 0

:notfound
ECHO Failed to find %NF_NAME% binaries 
EXIT /B 1
