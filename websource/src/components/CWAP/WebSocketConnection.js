import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { processCommand } from './CWAP';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import loadingBar from '../../static/noconnection.svg';
import './styles/WSC.css';

const setBlur = (state, message = 'Trying to get a response from server...') => {
	document.getElementById('main').classList[(['add', 'remove'][state ? 0 : 1])]('blurry');
	document.getElementsByClassName('layout-container')[0].classList[(['add', 'remove'][state ? 0 : 1])]('blurry');
	if (state && document.getElementById('loading') === null) {
		let loading = document.createElement('img');
		loading.src = loadingBar;
		loading.id = 'loading';
		document.body.appendChild(loading);
		setTimeout(() => {
			toast.warn(message, {
				position: 'top-center',
				closeButton: false,
				autoClose: false,
				closeOnClick: false,
				pauseOnHover: false,
				draggable: false,
				theme: 'colored',
			});
		}, 750);
	} else if (!state) {
		let blurSvg = document.getElementById('loading');
		if (blurSvg !== null) document.body.removeChild(blurSvg);
		toast.dismiss(); // уберет ВСЕ тосты висящие в момент
	}
}

const toBeResponded = {
	S: {
		answered: false,
		timeout: null
	}
};

const socketUrl = ('_self' in React.createElement('div')) ? `ws://${window.location.hostname}:8887/ws` : `ws://${window.location.host}/ws`;

let WebSocket = () => {
	const reconnectBtn = ({ closeToast }) => (
		<button
			className={(window.localStorage.getItem('DARKMODE_STATE') === 'true') ? 'reconnectBtn darkBtn' : 'reconnectBtn lightBtn'}
			onClick={(e) => { closeToast(e); window.location.reload(); }}
		>
			Retry
		</button>
	);
	const {
		sendMessage,
		readyState,
	} = useWebSocket(socketUrl, {
		onOpen: () => {
			document.getElementsByClassName('websocketStatus')[0].title = `WebSocket connection: ${ReadyState[readyState]}`;
			document.getElementsByClassName('websocketStatus')[0].style.background = connectionStatus;
			sendPacket('A', 'TEST');
			setBlur(false);
		},
		onClose: () => setBlur(true, 'Server closed the connection, we\'re trying to fix it...'),
		onError: (err) => toast.error(err),
		onMessage: (msg) => {
			msg.data.text().then((data) => {
				let tbr = undefined;
				if ((tbr = toBeResponded[data.charAt(0)]) !== undefined) {
					if (!tbr.timeout) setBlur(false);
					else {
						clearTimeout(tbr.timeout);
						tbr.timeout = null;
					}
					tbr.answered = true;
				}
				processCommand(data);
			});
		},
		share: true,
		protocols: 'cserver-cpl',
		reconnectInterval: 6,
		reconnectAttempts: 15,
		onReconnectStop: (attempts) => {
			toast.error(`Unable to reconnect to a WebSocket.\nSeems like your server is down.\nRetiring after ${attempts} attempts`, {
				position: 'top-center',
				autoClose: false,
				closeButton: reconnectBtn,
				closeOnClick: false,
				pauseOnHover: true,
				draggable: true,
				theme: (window.localStorage.getItem('DARKMODE_STATE') === 'true') ? 'dark' : 'light'
			});
		},
		shouldReconnect: () => true
	});

	const sendPacket = (id, ...args) => {
		let message = id, tbr = undefined;
		if ((tbr = toBeResponded[id]) !== undefined) {
			tbr.answered = false;
			if (tbr.timeout) clearTimeout(tbr.timeout);
			tbr.timeout = setTimeout(() => {
				tbr.timeout = null;
				if (!tbr.answered)
					setBlur(true);
			}, 500);
		}

		for (const arg of args) {
			switch (typeof (arg)) {
				case 'boolean':
					message += arg ? '1' : '0';
					break;
				case 'string':
					message += arg;
					break;
				default:
					arg && (message += (arg).toString());
					break;
			}

			message += '\x00';
		}

		sendMessage(message, false);
	};

	const connectionStatus = {
		[ReadyState.CONNECTING]: 'yellow',
		[ReadyState.OPEN]: 'green',
		[ReadyState.CLOSING]: 'red',
		[ReadyState.CLOSED]: 'red',
		[ReadyState.UNINSTANTIATED]: 'black',
	}[readyState];

	useEffect(() => {
		document.getElementsByClassName('websocketStatus')[0].title = `WebSocket connection: ${ReadyState[readyState]}`;
		let wsStat = document.getElementsByClassName('websocketStatus')[0];
		if (connectionStatus === 'yellow') {
			wsStat.classList.add('reconnecting');
		} else {
			wsStat.classList.remove('reconnecting');
		}
		wsStat.style.background = connectionStatus;
	});

	return ([sendPacket]);
};

export default WebSocket;
