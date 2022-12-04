import { toast } from 'react-toastify';
import { writeInConsole } from '../../pages/console';
import WebSocket from './WebSocketConnection';
import { doAuthGood, showAuth, hideAuth, showAuthError, hack_auth } from '../Auth';

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

	while (data_splitted.length > 0) {
		switch (data_splitted[0].at(0)) {
			case 'A':
				let status = data_splitted[0].substring(1);
				console.log('Auth:', status);
				const user_pass = localStorage.getItem('USER_PASSWORD');

				switch (status) {
					case 'REQ':
						if (user_pass !== null) {
							hack_auth(user_pass);
						} else {
							showAuth();
						}
						break;

					case 'OK':
						if (!user_pass) {
							doAuthGood();
						} else {
							hideAuth();
						}
						break;

					default:
					case 'FAIL':
						showAuthError();
						break;
				}

				data_splitted.shift();
				break;
			case 'B':
				let playerName = data_splitted[0].substring(1);
				let banSuccess = data_splitted[1];
				console.log('player:', playerName, 'isSuccess?:', banSuccess);
				data_splitted.splice(0, 1);
				break;
			case 'C':
				let msg = data_splitted[0].substring(1);
				writeInConsole(msg);
				data_splitted.shift();
				break;
			case 'E':
				let pluginEventType = data_splitted[0].charAt(1);
				let pluginId = data_splitted[1];
				console.log('Plugin Manage | Type: ',pluginEventType,'ID: ',pluginId);
				if (pluginEventType === 'A') {
					let pluginName = data_splitted[2];
					let pluginHtml = data_splitted[3];
					let pluginVer = data_splitted[4];
					console.log('pluginName:', pluginName, 'pluginHtml:', pluginHtml, 'pluginVer', pluginVer);
					data_splitted.splice(0, 4);
				} else {
					data_splitted.shift();
				}
				break;
			case 'N':
				let type = data_splitted[0].charAt(1);
				let text = data_splitted[1];
				notyType[type](text);
				data_splitted.splice(0, 1);
				break;
			case 'P':
				let playerEventType = data_splitted[0].charAt(1);
				let playerId = data_splitted[1]
				console.log('Player Event | Type:',playerEventType, 'ID:',playerId);
				switch (playerEventType) {
					case 'A':
						let playerName = data_splitted[2]
						let playerOp = data_splitted[3]
						let playerWorld = data_splitted[4]
						console.log('playerName', playerName, 'playerOp(?):',playerOp, 'playerWorld:',playerWorld);
						data_splitted.splice(0, 4);
						break;
					case 'R':
						data_splitted.shift();
						break;
					case 'W':
						let playerNewWorld = data_splitted[2];
						console.log('playerNewWorld:',playerNewWorld);
						data_splitted.splice(0, 2);
						break;
					case 'O':
						let playerNewOp = data_splitted[2];
						console.log('playerNewOp:',playerNewOp);
						data_splitted.splice(0, 2);
						break;

					default: throw {message: "Invalid player event received", eventCode: playerEventType};
				}
				break
			case 'S':
				let state = data_splitted[0].charAt(1);
				console.log('switch state:',state);
				switch (state) {
					case 'H':
						let usersTotal = data_splitted[1];
						let usersArray = data_splitted[2];
						let worldsCount = data_splitted[3];
						let worldsArray = data_splitted[4];
						console.log('usersTotal:',usersTotal, 'usersArray:',usersArray,'worldsCount:',worldsCount,'worldsArray:',worldsArray);
						data_splitted.splice(0, 4);
						break;
					case 'R':
						let logsCount = data_splitted[1];
						let logsArr = data_splitted[2];
						console.log('logsCount:', logsCount, 'logsArr:', logsArr);
						data_splitted.splice(0, 2);
						break;
					case 'C':
						let configStrsCount = data_splitted[1];
						let configStrs = data_splitted[2];
						console.log('configStrsCount:', configStrsCount, 'configStrs:', configStrs);
						data_splitted.splice(0, 2);
						break;
					case 'E':
						let pluginsCount = data_splitted[1];
						let pluginsArr = data_splitted[2];
						console.log('pluginsCount:', pluginsCount, 'pluginsArr:', pluginsArr);
						data_splitted.splice(0, 2);
						break;

					default: throw {message: "Invalid state packet received", stateCode: state};
				}
				break;
			case 'W':
				let worldEventType = data_splitted[0].charAt(1);
				let worldName = data_splitted[1];
				console.log('World Management | Type:',worldEventType, 'worldName:', worldName);
				switch (worldEventType) {
					case 'A':
						let texturepack = data_splitted[2];
						let seed = data_splitted[3];
						console.log('texturepack:',texturepack, 'seed:',seed);
						data_splitted.splice(0, 3);
						break;
					case 'R':
						data_splitted.shift();
						break;
					case 'S':
						let newStatus = data_splitted[2];
						console.log('newStatus:',newStatus);
						data_splitted.splice(0,2);
						break;
					case 'W':
						let newWeather = data_splitted[2];
						console.log('newWeather:',newWeather);
						data_splitted.splice(0,2);
						break;
					case 'T':
						let newTexturepack = data_splitted[2];
						console.log('newTexturepack:',newTexturepack);
						data_splitted.splice(0,2);
						break;

					default: throw {message: "Invalid world event received", eventCode: worldEventType};
				}
				break;
			default:
				data_splitted.shift();
				break;
		}
	}
};

let CWAP = () => {
	const [lastMessage, sendMessage] = WebSocket();
	// ПРОБЕЛ !!! \x00

	return ({
		getAnswer: () => { return lastMessage && lastMessage.data.text(); },

		sendAuth: (hash) => sendMessage(`A${hash}\x00`),
		banPlayer: (name) => sendMessage(`B${name}\x00Banned by WebAdmin\x000\x00`),
		kickPlayer: (name) => sendMessage(`K${name}\x00`),
		opPlayer: (name) => sendMessage(`O${name}\x001\x00`),
		deopPlayer: (name) => sendMessage(`O${name}\x000\x00`),
		switchState: (path) => { console.log('switch state to ', path); sendMessage(`S${state_paths[path]}\x00`); },
		sendConsole: (value) => { sendMessage(`C${value}\x00`); return value; }
	});
}

export default CWAP;
