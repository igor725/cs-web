IF "%PLUGIN_INSTALL%"=="1" (
	PUSHD %ROOT%\websource
	npm run build
	IF NOT "!ERRORLEVEL!"=="0" (
		ECHO Failed to build webdata
		EXIT /B 1
	)
	POPD

	XCOPY /E /S /Y "%ROOT%\websource\build\" "%SERVER_OUTROOT%\webdata\"
)
