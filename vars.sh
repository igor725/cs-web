if [ $PLUGIN_INSTALL -eq 1 ]; then
	pushd "$ROOT/websource/";
	if ! npm install; then
		echo "Failed to install dependencies";
		exit 1;
	fi
	if ! npm run build; then
		echo "Failed to build webdata";
		exit 1;
	fi
	popd;

	cp -rv "$ROOT/websource/build/" "$SERVER_OUTROOT/webdata/";
fi
