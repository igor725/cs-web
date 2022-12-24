BUILD_FRONTEND=0;
CFLAGS="$CFLAGS -I..";

for a in $PLUGIN_ARGS; do
	if [ "$a" == "wbuild" ]; then BUILD_FRONTEND=1; fi
done

if [ -f "../cs-lua/src/luaitf.h" ]; then
	if . ../cs-lua/vars.sh; then
		CFLAGS="$CFLAGS -DCSWEB_USE_LUA";
		echo "Lua interface connected";
	else
		echo "Failed to bind Lua interface";
	fi
fi

if [ -f "../cs-base/src/base_itf.h" ]; then
	CFLAGS="$CFLAGS -DCSWEB_USE_BASE";
	echo "Base interface connected";
fi

if [ $BUILD_FRONTEND -eq 1 ]; then
	if ! command -v npm 2>&1 > /dev/null; then
		echo "NodeJS is not installed!"
		return 1;
	fi
	pushd "$ROOT/websource/";
	if ! npm install; then
		echo "Failed to install dependencies";
		return 1;
	fi
	if ! npm run build; then
		echo "Failed to build webdata";
		return 1;
	fi
	popd;

	PLUGIN_INSTALL_PATH="$OUTDIR/webdata";
	if [ $PLUGIN_INSTALL -eq 1 ]; then
		PLUGIN_INSTALL_PATH="$SERVER_OUTROOT/webdata";
	fi

	mv "$ROOT/websource/build" "$PLUGIN_INSTALL_PATH";
fi

