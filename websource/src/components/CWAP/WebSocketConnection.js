import React, { useState, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

export const WebSocket = () => {
    const [socketUrl, setSocketUrl] = useState(`ws://127.0.0.1:8887/ws`);
    const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {protocols: "cserver-cpl"});

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'yellow',
        [ReadyState.OPEN]: 'yellowgreen',
        [ReadyState.CLOSING]: 'red',
        [ReadyState.CLOSED]: 'red',
        [ReadyState.UNINSTANTIATED]: 'black',
    }[readyState];
    useEffect(()=>{
        document.getElementsByClassName("websocketStatus")[0].title += `: ${ReadyState[readyState]}`
        document.getElementsByClassName("websocketStatus")[0].style.background = connectionStatus
    })
    return ([socketUrl, lastMessage, sendMessage])
}
export default WebSocket