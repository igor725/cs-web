import { useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

// Я в ахуе что можно импортировать из файла, 
// который импортирует из ЭТОГО файла
import { processCommand } from './CWAP'

export const socketUrl = `ws://127.0.0.1:8887/ws`

let WebSocket = () => {
    const {
        sendMessage,
        sendJsonMessage,
        lastMessage,
        lastJsonMessage,
        readyState,
        getWebSocket,
    } = useWebSocket(socketUrl, {
        onOpen: () => {
            document.getElementsByClassName("websocketStatus")[0].title = `WebSocket connection: ${ReadyState[readyState]}`
            document.getElementsByClassName("websocketStatus")[0].style.background = connectionStatus
        },
        onMessage: (msg) => {
            msg.data.text().then((data) => {
                processCommand(data)
            })
        },
        share: true,
        protocols: "cserver-cpl",
        reconnectInterval: 5,
        reconnectAttempts: 30,
        shouldReconnect: (closeEvent) => true,
    });
    const connectionStatus = {
        [ReadyState.CONNECTING]: 'yellow',
        [ReadyState.OPEN]: 'yellowgreen',
        [ReadyState.CLOSING]: 'red',
        [ReadyState.CLOSED]: 'red',
        [ReadyState.UNINSTANTIATED]: 'black',
    }[readyState];
    useEffect(() => {
        document.getElementsByClassName("websocketStatus")[0].title = `WebSocket connection: ${ReadyState[readyState]}`
        document.getElementsByClassName("websocketStatus")[0].style.background = connectionStatus
    })
    return ([getWebSocket, lastMessage, sendMessage])
}
export default WebSocket;