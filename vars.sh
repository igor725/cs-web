if [ $PLUGIN_INSTALL -eq 1 ]; then
	pushd "$ROOT/cs-web/webdata/";
	if ! npm run build; then
		echo "";
		exit 1;
	fi
	popd;

	cp -rv "$ROOT/cs-web/webdata/" "$SERVER_OUTROOT/webdata/";
fi
