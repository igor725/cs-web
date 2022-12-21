import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import { processCommand } from './CWAP';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import './styles/WSC.css';

const loadingBar = `data:image/svg+xml,<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><style>.spinner_kpYo{animation:spinner_cQNQ 1.55s linear infinite}.spinner_Esax{animation:spinner_sZau 1.55s linear infinite}.spinner_o8QU{animation:spinner_aBcq 1.55s linear infinite}@keyframes spinner_cQNQ{0%,87.1%,100%{opacity:0}16.13%,80.65%{opacity:1}}@keyframes spinner_sZau{0%,16.13%,87.1%,100%{opacity:0}32.26%,80.65%{opacity:1}}@keyframes spinner_aBcq{0%,32.26%,87.1%,100%{opacity:0}48.39%,80.65%{opacity:1}}</style><path class="spinner_kpYo" d="M12,21L15.6,16.2C14.6,15.45 13.35,15 12,15C10.65,15 9.4,15.45 8.4,16.2L12,21" opacity="0"/><path class="spinner_kpYo spinner_Esax" d="M12,9C9.3,9 6.81,9.89 4.8,11.4L6.6,13.8C8.1,12.67 9.97,12 12,12C14.03,12 15.9,12.67 17.4,13.8L19.2,11.4C17.19,9.89 14.7,9 12,9Z" opacity="0"/><path class="spinner_kpYo spinner_o8QU" d="M12,3C7.95,3 4.21,4.34 1.2,6.6L3,9C5.5,7.12 8.62,6 12,6C15.38,6 18.5,7.12 21,9L22.8,6.6C19.79,4.34 16.05,3 12,3" opacity="0"/></svg>`;

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
