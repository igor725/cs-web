IF "%PLUGIN_INSTALL%"=="1" (
	@REM TODO: Build webdata
	XCOPY /E /S /Y "%ROOT%\websource\build\" "%SERVER_OUTROOT%\webdata\"
)
