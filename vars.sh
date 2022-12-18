CFLAGS="$CFLAGS -I..";

if [ -f "../cs-lua/src/luaitf.h" ]; then
	echo "Lua interface connected";
	CFLAGS="$CFLAGS -DCSWEB_USE_LUA";
	. ../cs-lua/vars.sh;
fi

if [ -f "../cs-base/src/base_itf.h" ]; then
	echo "Base interface connected";
	CFLAGS="$CFLAGS -DCSWEB_USE_BASE";
fi

if [ $PLUGIN_INSTALL -eq 1 ]; then
	if [ "$PLUGIN_ARGS" == "wbuild" ]; then
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

		cp -rv "$ROOT/websource/build/" "$SERVER_OUTROOT/webdata/";
	fi
fi
