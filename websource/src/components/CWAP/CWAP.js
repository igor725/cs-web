import { toast } from 'react-toastify';
import { writeInConsole } from '../../pages/console';
import WebSocket from './WebSocketConnection';
import { doAuthGood, showAuth, showAuthError, doLogin } from '../Auth';
import { updateGlobalList } from '../PlayersList';
import { updateWorlds } from '../Worlds';
import { updatePlugins } from '../../pages/pmanager';
import { setCounters } from '../Statistic';

export let playersList = [];
export let worldsList = [];

export let pluginsList = [];
export let scriptsList = [];

export let webId;
export let startupTime = 0;
export let ramSize = -1;
export let ramUsage = -1;

let softwareName = 'loading...';
let currentPage = null;

const getObject = (arr, id) => {
	return arr.find((cobj) => {
		return cobj.id === id;
	}) || null;
};

const createPlayer = (data, idx) => {
	const playerId = parseInt(data[idx]);
	const playerName = data[idx + 1];
	const playerOp = parseInt(data[idx + 2]);
	const playerWorld = data[idx + 3];
	let player = null;

	if ((player = getObject(playersList, playerId)) !== null) {
		player.name = playerName;
		player.world = playerWorld;
		player.isAdmin = playerOp;
	} else {
		playersList.push({
			name: playerName,
			id: playerId,
			world: playerWorld,
			isAdmin: playerOp
		});
	}

	return 4;
};

const createWorld = (data, idx) => {
	const worldName = data[idx + 0];
	const texturepack = data[idx + 1] || 'Default';
	const size = [data[idx + 2], data[idx + 3], data[idx + 4]].join('x');
	const spawn = [
		parseFloat(data[idx + 5]).toFixed(2),
		parseFloat(data[idx + 6]).toFixed(2),
		parseFloat(data[idx + 7]).toFixed(2)
	].join(',');
	const weather = parseInt(data[idx + 8]);
	const status = parseInt(data[idx + 9]);
	let world = null;

	if ((world = getObject(worldsList, worldName)) !== null) {
		world.texturepack = texturepack;
		world.size = size;
		world.spawn = spawn;
		world.weather = weather;
		world.status = status;
	} else {
		worldsList.push({
			id: worldName,
			texturepack: texturepack,
			size: size,
			spawn: spawn,
			weather: weather,
			status: status
		});
	}

	return 10;
};

const createExtension = (data, idx) => {
	const extId = parseInt(data[idx + 0]);
	const extVer = parseInt(data[idx + 1]);
	const extName = data[idx + 2];
	const extHome = data[idx + 3];
	let ext = null;

	if ((ext = getObject(pluginsList, extId)) !== null) {
		ext.version = extVer;
		ext.home = extHome;
		ext.name = extName;
	} else {
		pluginsList.push({
			id: extId,
			version: extVer,
			name: extName,
			home: extHome
		});
	}

	return 4;
};

const createLuaExtension = (data, idx) => {
	const extId = parseInt(data[idx + 0]);
	const extVer = parseInt(data[idx + 1]);
	const extHotReload = parseInt(data[idx + 2]) > 0;
	const extName = data[idx + 3];
	const extHome = data[idx + 4];
	let ext = null;

	if ((ext = getObject(scriptsList, extId)) !== null) {
		ext.home = extHome;
		ext.version = extVer;
		ext.hotReload = extHotReload;
	} else {
		scriptsList.push({
			id: extId,
			version: extVer,
			hotReload: extHotReload,
			name: extName,
			home: extHome
		});
	}

	return 5;
};

const updateAll = () => {
	updateGlobalList();
	updateWorlds();
};

const statePaths = {
	'/': 'H',
	'/configeditor': 'C',
	'/console': 'R',
	'/pluginmanager': 'E'
};

const notyType = {
	'E': toast.error,
	'I': toast.info,
	'W': toast.warn
};

export let processCommand = (data) => {
	console.log(`>> ${data}`);
	let data_splitted = data.split('\x00');

	while (data_splitted.length > 1) {
		const packetId = data_splitted[0].at(0);
		/* Тут число элементов массива, которое нужно пидорнуть после обработки пакета.
		** Оно всегда должно быть равно {количеству полей в обрабатываемом пакете} + 1,
		** в ином случае - гроб гроб кладбище пидор. Для пакетов, не имеющих полей,
		** логично предположить, переменная равна просто 1. */
		let spcnt = 2;

		switch (packetId) {
			case 'A':
				const status = data_splitted[0].substring(1);
				const user_pass = localStorage.getItem('USER_PASSWORD');
				spcnt = 1;

				switch (status) {
					case 'REQ':
						(user_pass !== null) ? doLogin(user_pass) : showAuth();
						break;

					case 'OK':
						spcnt = 7;
						softwareName = `${data_splitted[1]}/${data_splitted[2]}`;
						webId = parseInt(data_splitted[5]);
						ramSize = parseInt(data_splitted[6]);
						(user_pass ? doAuthGood(true) : doAuthGood(false));
						startupTime = parseInt(data_splitted[3]);
						setCounters(parseInt(data_splitted[4]));
						break;

					default:
					case 'FAIL':
						showAuthError();
						break;
				}

				break;
			case 'C':
				const msg = data_splitted[0].substring(1);
				writeInConsole(msg);
				spcnt = 1;
				break;
			case 'E':
				spcnt = 3;
				const extEventType = data_splitted[0].charAt(1);
				const extType = parseInt(data_splitted[1]) % 2;

				switch (extEventType) {
					case 'A':
						spcnt = [createExtension, createLuaExtension][extType](data_splitted, 2) + 2;
						break;
					case 'R':
						const extId = parseInt(data_splitted[2]);
						let list = [pluginsList, scriptsList][extType];
						list.every((ext, index) => {
							if (ext.id === extId) {
								list.splice(index, 1);
								return false;
							}
							return true;
						});
						break;
					default: throw { message: 'Invalid extension event received', eventCode: extEventType };
				}

				updatePlugins();
				break;
			case 'N':
				notyType[data_splitted[0].charAt(1)](data_splitted[1]);
				break;
			case 'P':
				const playerEventType = data_splitted[0].charAt(1);
				const playerId = parseInt(data_splitted[1]);
				const player = getObject(playersList, playerId);
				spcnt = 3;

				switch (playerEventType) {
					case 'A':
						spcnt = createPlayer(data_splitted, 1) + 1;
						break;
					case 'R':
						spcnt = 2;
						playersList.every((player, index) => {
							if (player.id === playerId) {
								playersList.splice(index, 1);
								return false;
							}
							return true;
						});
						break;
					case 'W':
						if (player) player.world = data_splitted[2];
						break;
					case 'O':
						if (player) player.isAdmin = parseInt(data_splitted[2]);
						break;
					default: throw { message: 'Invalid player event received', eventCode: playerEventType };
				}
				updateAll();
				break;
			case 'R':
				spcnt = 1;
				ramUsage = parseInt(data_splitted[0].substring(1));
				break;
			case 'S':
				const state = data_splitted[0].charAt(1);
				console.log('State switched to:', state);

				switch (state) {
					case 'H':
						spcnt = 0;
						const lists = data.substring(3).split('\x01');

						const worlds = lists[1].split('\x00');
						if (worlds.length > 0 && worlds[0].length > 0) {
							for (let i = 0; ;) {
								if (!worlds[i]) break;
								const ido = createWorld(worlds, i);
								spcnt += ido; i += ido;
							}
						}

						const players = lists[0].split('\x00');
						if (players.length > 0 && players[0].length > 0) {
							for (let i = 0; ;) {
								if (!players[i]) break;
								const ido = createPlayer(players, i);
								spcnt += ido; i += ido;
							}
						}

						spcnt += 2;
						ramUsage = parseInt(data_splitted[spcnt++]);
						updateAll();
						break;

					case 'R':
						spcnt = parseInt(data_splitted[1], 10) + 2;
						for (let i = 2; i < spcnt; i++)
							writeInConsole(data_splitted[i]);
						break;

					case 'E':
						spcnt = 0;
						const exts = data.substring(3).split('\x01');

						const native = exts[0].split('\x00');
						if (native.length > 0 && native[0].length > 0) {
							for (let i = 0; ;) {
								if (!native[i]) break;
								const ido = createExtension(native, i);
								spcnt += ido; i += ido;
							}
						}

						const lua = exts[1].split('\x00');
						if (lua.length > 0 && lua[0].length > 0) {
							for (let i = 0; ;) {
								if (!lua[i]) break;
								const ido = createLuaExtension(lua, i);
								spcnt += ido; i += ido;
							}
						}

						spcnt += 2;
						updatePlugins();
						break;

					case 'C':
						spcnt = 1;
						break;

					default: throw { message: 'Invalid state packet received', stateCode: state };
				}
				break;
			case 'W':
				const worldEventType = data_splitted[0].charAt(1);
				const worldName = data_splitted[1];
				const world = getObject(worldsList, worldName);
				spcnt = 3;

				switch (worldEventType) {
					case 'A':
						spcnt = createWorld(data_splitted, 1) + 1;
						break;
					case 'R':
						spcnt = 2;
						worldsList.every((eworld, index) => {
							if (eworld.id === worldName) {
								worldsList.splice(index, 1);
								return false;
							}
							return true;
						});
						break;
					case 'S':
						if (world) world.status = parseInt(data_splitted[2]);
						break;
					case 'W':
						if (world) world.weather = parseInt(data_splitted[2]);
						break;
					case 'T':
						if (world) world.texturepack = data_splitted[2] || 'Default';
						break;

					default: throw { message: 'Invalid world event received', eventCode: worldEventType };
				}
				updateWorlds();
				break;

			default: throw { message: 'Unknown packet received', packetId: packetId };
		}

		spcnt = Math.max(1, spcnt);
		if (data_splitted.length <= spcnt)
			throw { message: 'Гроб гроб кладбище пидор!!!' };
		data_splitted.splice(0, spcnt);
	}
};

let CWAP = () => {
	const [sendPacket] = WebSocket();

	return ({
		getSoftwareName: () => { return softwareName; },

		unloadExtension: (type, id, force) => sendPacket('E', 'U', type, id, force),
		reldisExtension: (type, id) => sendPacket('E', 'D', type, id),
		sendAuth: (hash) => sendPacket('A', hash),
		banPlayer: (name) => sendPacket('B', name, 'Banned by WebAdmin', 0),
		kickPlayer: (name) => sendPacket('K', name),
		setUserState: (name, state) => sendPacket('O', name, state),
		changeWeather: (world, weather) => sendPacket('W', world, weather),
		switchState: (path) => {
			if (currentPage !== path) {
				sendPacket('S', statePaths[path]);
				currentPage = path;
				return true;
			}

			return false;
		},
		sendConsole: (value) => { sendPacket('C', value); return value; }
	});
}

export default CWAP;
