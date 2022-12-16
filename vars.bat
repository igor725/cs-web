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
	SET CSLUA_ONLY_INCLUDES=1
	CALL ..\cs-lua\vars.bat
)

IF "%CSWEB_BUILD_FRONTEND%"=="1" (
	PUSHD %ROOT%\websource
	npm install && npm run build
	IF NOT "%ERRORLEVEL%"=="0" (
		POPD
		ECHO Failed to build webdata
		EXIT /B 1
	)
	POPD

	IF "%PLUGIN_INSTALL%"=="1" (
		XCOPY /E /S /Y "%ROOT%\websource\build\" "%SERVER_OUTROOT%\webdata\"
	) ELSE (
		XCOPY /E /S /Y "%ROOT%\websource\build\" "%OUTDIR%\webdata\"
	)

	RMDIR /S /Q "%ROOT%\websource\build\"
)
