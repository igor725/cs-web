import React, { useEffect } from 'react';
import { toast } from 'react-toastify';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import './styles/WSC.css';

// Я в ахуе что можно импортировать из файла, 
// который импортирует из ЭТОГО файла
import { processCommand } from './CWAP';

const socketUrl = `ws://127.0.0.1:8887/ws`;
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
		lastMessage,
		readyState,
	} = useWebSocket(socketUrl, {
		onOpen: () => {
			document.getElementsByClassName('websocketStatus')[0].title = `WebSocket connection: ${ReadyState[readyState]}`;
			document.getElementsByClassName('websocketStatus')[0].style.background = connectionStatus;
			sendMessage('ATEST\x00');
		},
		onError: (err) => {
			toast.error(err);
		},
		onMessage: (msg) => {
			msg.data.text().then((data) => {
				processCommand(data);
			});
		},
		share: true,
		protocols: 'cserver-cpl',
		reconnectInterval: 3,
		reconnectAttempts: 15,
		onReconnectStop: (attempts) => {
			toast.error(`Unable to reconnect to a WebSocket.\nSeems like your server is down.\nRetiring after ${attempts} attempts`, {
				position: 'top-center',
				autoClose: false,
				closeButton: reconnectBtn,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				theme: ((window.localStorage.getItem('DARKMODE_STATE') === 'true') || false ? 'dark':'light'),
			});
		},
		shouldReconnect: (closeEvent) => true,
	});
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
	return ([lastMessage, sendMessage]);
};

export default WebSocket;
