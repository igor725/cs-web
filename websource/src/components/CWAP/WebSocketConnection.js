import React, { useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

export const WebSocket = () => {
    const [socketUrl, setSocketUrl] = useState(`ws://127.0.0.1:8887/ws`);
    const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {protocols: "cserver-cpl"});

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];
    // console.log(connectionStatus)
    return ([socketUrl, lastMessage, sendMessage])
}
export default WebSocket