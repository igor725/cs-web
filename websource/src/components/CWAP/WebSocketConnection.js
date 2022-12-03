import React, { useState, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
export const socketUrl = `ws://127.0.0.1:8887/ws`

let LastMessage;

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