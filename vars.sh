BUILD_FRONTEND=0
CFLAGS="$CFLAGS -I..";

for a in $PLUGIN_ARGS; do
	if [ "$a" == "wbuild" ]; then BUILD_FRONTEND=1; fi
done

if [ -f "../cs-lua/src/luaitf.h" ]; then
	echo "Lua interface connected";
	CFLAGS="$CFLAGS -DCSWEB_USE_LUA";
	. ../cs-lua/vars.sh;
fi

if [ -f "../cs-base/src/base_itf.h" ]; then
	echo "Base interface connected";
	CFLAGS="$CFLAGS -DCSWEB_USE_BASE";
fi

if [ $BUILD_FRONTEND -eq 1 ]; then
	if ! command -v 7z; then
		echo "Failed to find 7z archiver";
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

	PLUGIN_INSTALL_PATH="$OUTDIR/webdata.zip";
	if [ $PLUGIN_INSTALL -eq 1 ]; then
		PLUGIN_INSTALL_PATH="$SERVER_OUTROOT/webdata.zip";
	fi

	7z a -tzip $PLUGIN_INSTALL_PATH $ROOT/websource/build;
fi

