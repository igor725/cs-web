IF "%PLUGIN_INSTALL%"=="1" (
	XCOPY /E /S /Y "%ROOT%\webdata\" "%SERVER_OUTROOT%\webdata\"
)
