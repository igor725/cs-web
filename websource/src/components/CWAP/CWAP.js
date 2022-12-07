import { toast } from 'react-toastify';
import { writeInConsole } from '../../pages/console';
import WebSocket from './WebSocketConnection';
import { doAuthGood, showAuth, hideAuth, showAuthError, doLogin } from '../Auth';
import { updateGlobalList } from '../PlayersList';
import { updateWorlds } from '../Worlds';

export let playersList = [];
export let worldsList = [];

const getWorld = (worldName) => {
	let wrld;
	worldsList.every((world, index) => {
		if (world.name === worldName){
			wrld = worldsList[index];
			return false;
		}
		return true;
	})
	return wrld;
};

const getPlayer = (playerId) => {
	let pl;
	playersList.every((player, index) => {
		if (player.id === playerId){
			pl = playersList[index];
			return false;
		}
		return true;
	})
	return pl;
};

const updateUsers = () =>{
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

	while (data_splitted.length > 0) {
		switch (data_splitted[0].at(0)) {
			case 'A':
				let status = data_splitted[0].substring(1);
				console.log('Auth:', status);
				const user_pass = localStorage.getItem('USER_PASSWORD');

				switch (status) {
					case 'REQ':
						if (user_pass !== null) {
							doLogin(user_pass, true);
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
				let playerId = parseInt(data_splitted[1]);
				let player = getPlayer(playerId)
				switch (playerEventType) {
					case 'A':
						let playerName = data_splitted[2];
						let playerOp = parseInt(data_splitted[3]);
						let playerWorld = data_splitted[4]
						playersList.push({
							"name": playerName,
							"id": playerId,
							"world": playerWorld,
							"isAdmin": playerOp
						});
						data_splitted.splice(0, 4);
						break;
					case 'R':
						let pl;
						playersList.every((player, index) => {
							if (player.id === playerId){
								pl = playersList[index];
								return false;
							}
							return true;
						})
						playersList.splice(pl, 1);
						data_splitted.shift();
						break;
					case 'W':
						let playerNewWorld = data_splitted[2];
						if (player){
							player.world = playerNewWorld;
						};
						data_splitted.splice(0, 2);
						break;
					case 'O':
						let playerNewOp = parseInt(data_splitted[2]);
						if (player){
							player.isAdmin = playerNewOp;
						}
						data_splitted.splice(0, 2);
						break;
					default: throw {message: "Invalid player event received", eventCode: playerEventType};
				}
				updateUsers();
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
						const logsCount = parseInt(data_splitted[1], 10);
						const endLogs = logsCount + 2;
						for (let i = 2; i < endLogs; i++)
							writeInConsole(data_splitted[i]);
						data_splitted.splice(0, endLogs);
						const cout = document.getElementById('console-out');
						cout.scrollTop = cout.scrollHeight;
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
				let world = getWorld(worldName)
				console.log('World Management | Type:',worldEventType, 'worldName:', worldName);
				switch (worldEventType) {
					case 'A':
						let texturepack = data_splitted[2] || "Default";
						let size = [data_splitted[3], data_splitted[4], data_splitted[5]];
						let spawn = [
							parseFloat(data_splitted[6]).toFixed(2), 
							parseFloat(data_splitted[7]).toFixed(2),
							parseFloat(data_splitted[8]).toFixed(2)
						]
						let weather = parseInt(data_splitted[9]);
						let status = parseInt(data_splitted[10]);
						worldsList.push(
							{
								"name": worldName, 
								"texturepack": texturepack, 
								"size": size.join("x"), 
								"spawn": `x: ${spawn[0]}, y: ${spawn[1]}, z: ${spawn[2]}`, 
								"weather": weather, 
								"status": status
							}
						);
						updateWorlds();
						data_splitted.splice(0, 10);
						break;
					case 'R':
						let wIndex;
						worldsList.every((world, index) => {
							if (world.name = worldName){
								wIndex = index;
								return false;
							}
							return true;
						});
						updateWorlds();
						worldsList.splice(wIndex, 1);
						data_splitted.shift();
						break;
					case 'S':
						let newStatus = parseInt(data_splitted[2]);
						if (world) {
							world.status = newStatus;
						};
						updateWorlds();
						data_splitted.splice(0,2);
						break;
					case 'W':
						let newWeather = parseInt(data_splitted[2]);
						if (world) {
							world.weather = newWeather;
						};
						updateWorlds();
						data_splitted.splice(0,2);
						break;
					case 'T':
						let newTexturepack = data_splitted[2];
						if (world) {
							world.texturepack = newTexturepack;
						};
						updateWorlds();
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

		sendAuth: (hash) => sendMessage(`A${hash}\x00`, false),
		banPlayer: (name) => sendMessage(`B${name}\x00Banned by WebAdmin\x000\x00`, false),
		kickPlayer: (name) => sendMessage(`K${name}\x00`, false),
		opPlayer: (name) => sendMessage(`O${name}\x001\x00`, false),
		deopPlayer: (name) => sendMessage(`O${name}\x000\x00`, false),
		switchState: (path) => { console.log('switch state to ', path); sendMessage(`S${state_paths[path]}\x00`, false); },
		sendConsole: (value) => { sendMessage(`C${value}\x00`, false); return value; }
	});
}

export default CWAP;
