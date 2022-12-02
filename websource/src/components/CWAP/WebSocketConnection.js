import React, { useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

export const WebSocket = () => {
    const [socketUrl, setSocketUrl] = useState(`ws://${window.location.host}/ws`);
    const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];
    console.log(connectionStatus)
    return ([socketUrl, lastMessage, sendMessage])
}
export default WebSocket