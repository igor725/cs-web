import React, { useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

export const WebSocket = () => {
    const [socketUrl, setSocketUrl] = useState('ws://igvx.ru:8880/');
    const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

    // const handleClickSendMessage = useCallback(() => sendMessage('Hello'), []);

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];
    return ([lastMessage, sendMessage])
}
export default WebSocket

