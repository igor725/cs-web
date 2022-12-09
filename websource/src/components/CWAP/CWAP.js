import { toast } from 'react-toastify';
import { writeInConsole } from '../../pages/console';
import WebSocket from './WebSocketConnection';
import { doAuthGood, showAuth, showAuthError, doLogin } from '../Auth';
import { updateGlobalList } from '../PlayersList';
import { updateWorlds } from '../Worlds';

export let playersList = [];
export let worldsList = [];

const getWorld = (worldName) => {
	let wrld = undefined;
	worldsList.every((world, index) => {
		if (world.name === worldName) {
			wrld = worldsList[index];
			return false;
		}
		return true;
	})
	return wrld;
};

const getPlayer = (playerId) => {
	let pl = undefined;
	playersList.every((player, index) => {
		if (player.id === playerId) {
			pl = playersList[index];
			return false;
		}
		return true;
	})
	return pl;
};

const createPlayer = (data_splitted, startIndex) => {
	let playerId = parseInt(data_splitted[startIndex]);
	let playerName = data_splitted[startIndex + 1];
	let playerOp = parseInt(data_splitted[startIndex + 2]);
	let playerWorld = data_splitted[startIndex + 3];
	let player = undefined;

	if ((player = getPlayer(playerId)) !== undefined) {
		player.name = playerName;
		player.world = playerWorld;
		player.isAdmin = playerOp;
	} else {
		playersList.push({
			'name': playerName,
			'id': playerId,
			'world': playerWorld,
			'isAdmin': playerOp
		});
	}

	return 4;
}

const createWorld = (data_splitted, startIndex) => {
	let worldName = data_splitted[startIndex];
	let texturepack = data_splitted[startIndex + 1] || 'Default';
	let size = [data_splitted[startIndex + 2], data_splitted[startIndex + 3], data_splitted[startIndex + 4]].join('x');
	let spawn = [
		parseFloat(data_splitted[startIndex + 5]).toFixed(2),
		parseFloat(data_splitted[startIndex + 6]).toFixed(2),
		parseFloat(data_splitted[startIndex + 7]).toFixed(2)
	].join(',');
	let weather = parseInt(data_splitted[startIndex + 8]);
	let status = parseInt(data_splitted[startIndex + 9]);
	let world = undefined;

	if ((world = getWorld(worldName)) !== undefined) {
		world.texturepack = texturepack;
		world.size = size;
		world.spawn = spawn;
		world.weather = weather;
		world.status = status;
	} else {
		worldsList.push({
			'name': worldName,
			'texturepack': texturepack,
			'size': size,
			'spawn': spawn,
			'weather': weather,
			'status': status
		});
	}

	return 10;
}

const updateAll = () => {
	updateGlobalList();
	updateWorlds();
};

const state_paths = {
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
	console.log('RAW DATA: ', data);
	let data_splitted = data.split('\x00');

	while (data_splitted.length > 1) {
		const packetId = data_splitted[0].at(0);
		/* Тут число элементов массива, которое нужно пидорнуть после обработки пакета
		** оно всегда должно быть равно {количеству полей в обрабатываемом пакете} + 1,
		** в ином случае - гроб гроб кладбище пидор. Для пакетов, не имеющих полей,
		** логично предположить, переменная равна просто 1.
		** И да, A-пакет не имеет полей, так как у нас первое поле сливается с 
		** идентификатором пакета. */
		let spcnt = 2;

		switch (packetId) {
			case 'A':
				const status = data_splitted[0].substring(1);
				console.log('Auth:', status);
				const user_pass = localStorage.getItem('USER_PASSWORD');
				spcnt = 1;

				switch (status) {
					case 'REQ':
						(user_pass !== null) ? doLogin(user_pass) : showAuth();
						break;

					case 'OK':
						spcnt = 3;
						const software = data_splitted[1];
						const git_tag = data_splitted[2];

						console.log(`Current software: ${software}/${git_tag}`);
						(user_pass ? doAuthGood(true) : doAuthGood(false));
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
			/*case 'E':
				spcnt = 5;
				const pluginEventType = data_splitted[0].charAt(1);
				const pluginId = data_splitted[1];
				console.log('Plugin Manage | Type: ',pluginEventType,'ID: ',pluginId);
				if (pluginEventType === 'A') {
					const pluginName = data_splitted[2];
					const pluginHtml = data_splitted[3];
					const pluginVer = data_splitted[4];
					console.log('pluginName:', pluginName, 'pluginHtml:', pluginHtml, 'pluginVer', pluginVer);

				}
				break;*/
			case 'N':
				notyType[data_splitted[0].charAt(1)](data_splitted[1]);
				break;
			case 'P':
				const playerEventType = data_splitted[0].charAt(1);
				const playerId = parseInt(data_splitted[1]);
				const player = getPlayer(playerId);
				spcnt = 3;

				switch (playerEventType) {
					case 'A':
						spcnt = createPlayer(data_splitted, 1) + 1;
						break;
					case 'R':
						spcnt = 2;
						playersList.every((player, index) => {
							if (player.id === playerId) {
								playersList.splice(index, 1)
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
			case 'S':
				const state = data_splitted[0].charAt(1);
				console.log('switch state:', state);
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

						spcnt += 1;
						updateAll();
						break;

					case 'R':
						spcnt = parseInt(data_splitted[1], 10) + 2;
						for (let i = 2; i < spcnt; i++)
							writeInConsole(data_splitted[i]);
						break;
					
					case 'E':
						spcnt = 1;
						break;

					default: throw { message: 'Invalid state packet received', stateCode: state };
				}
				break;
			case 'W':
				const worldEventType = data_splitted[0].charAt(1);
				const worldName = data_splitted[1];
				const world = getWorld(worldName);
				spcnt = 3;

				console.log('World Management | Type:', worldEventType, 'worldName:', worldName);
				switch (worldEventType) {
					case 'A':
						spcnt = createWorld(data_splitted, 1) + 1;
						break;
					case 'R':
						spcnt = 2;
						worldsList.every((eworld, index) => {
							if (eworld.name === worldName) {
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

		console.log(data_splitted.length, spcnt);
		if (data_splitted.length <= spcnt)
			throw { message: 'Гроб гроб кладбище пидор!!!' };
		data_splitted.splice(0, spcnt);

		if (data_splitted[0].at(0) === '\x01')
			data_splitted[0] = data_splitted[0].slice(1);
	}
};

let CWAP = () => {
	const [sendPacket] = WebSocket();

	return ({
		sendAuth: (hash) => sendPacket('A', hash),
		banPlayer: (name) => sendPacket('B', name, 'Banned by WebAdmin', 0),
		kickPlayer: (name) => sendPacket('K', name),
		opPlayer: (name) => sendPacket('O', name, 1),
		changeWeather: (world, weather) => sendPacket("w", world, weather),
		deopPlayer: (name) => sendPacket('O', name, 0),
		switchState: (path) => { console.log('switch state to ', path); sendPacket('S', state_paths[path]); },
		sendConsole: (value) => { sendPacket('C', value); return value; }
	});
}

export default CWAP;
