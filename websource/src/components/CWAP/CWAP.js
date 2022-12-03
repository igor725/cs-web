import { toast } from 'react-toastify';
import { MD5 } from "md5-js-tools";
import WebSocket from './WebSocketConnection'


const state_paths = {
    "/": "H",
    "/configeditor": "C",
    "/console": "R",
    "/pluginmanager": "E"
}

const notyType = {
    "E": toast.error,
    "I": toast.info,
    "W": toast.warn
}

function sendNotification(data) {
    if (data.charAt(0).startsWith("N")) {
        const errMsg = data.slice(2, -1);
        notyType[data.charAt(1)](errMsg)
    }
}

export function processCommand(data) {
    console.log(data)
    switch (data.charAt(0)) {
        case "N":
            sendNotification(data);
    }
}
function CWAP() {
    const [_gws, lastMessage, sendMessage] = WebSocket();
    // const gws = _gws();
    
    function getAnswer() {
        return lastMessage && lastMessage.data.text();
    }
    // ПРОБЕЛ !!! \x00
    function sendAuth(password) {
        const hash = MD5.generate(password);
        sendMessage(`A${hash}\x00`);
    }
    function banPlayer(name, reason, seconds) {
        const ban_props = `${name}\x00${reason}\x00${seconds}`;
        sendMessage(`B${ban_props}\x00`);
    }
    function kickPlayer(name) {
        sendMessage(`K${name}\x00`);
    }
    function opPlayer(name) {
        sendMessage(`O${name}\x001\x00`);
    }
    function deopPlayer(name) {
        sendMessage(`O${name}\x000\x00`);
    }
    function switchState(path) {
        sendMessage(`S${state_paths[path]}\x00`);
    }
    return ({
        sendAuth: sendAuth,
        getAnswer: getAnswer,
        banPlayer: banPlayer,
        kickPlayer: kickPlayer,
        opPlayer: opPlayer,
        deopPlayer: deopPlayer,
        switchState: switchState,
        _sendMessage: sendMessage
    })
}

export default CWAP