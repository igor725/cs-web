import { toast } from 'react-toastify';
import { MD5 } from "md5-js-tools";
import WebSocket from './WebSocketConnection'


const state_paths = {
    "/":                "H", 
    "/configeditor":    "C", 
    "/console":         "R", 
    "/pluginmanager":   "E"
}
// ПРОБЕЛ !!! \x00
let prev_data;
let streaks = 0;
function CWAP(){
    const [wsc, lastMessage, sendMessage] = WebSocket();
    const WSC = wsc();

    function handleNotify(data){
        if (data.charAt(0).startsWith("N")){
            const errMsg = data.slice(2, -1);
            let sendNoty;
            console.log(data.charAt(1));
            switch (data.charAt(1)){
                case 'E':
                    sendNoty = toast.error;
                    break;
                case 'I':
                    sendNoty = toast.info;
                    break;
                case 'W':
                    sendNoty = toast.warn;
                    break;
            }
            sendNoty(errMsg);
        }
    }
    function getAnswer(){
        if (lastMessage){
            lastMessage.data.text().then((data)=>{
                handleNotify(data);
            })
        }
        return lastMessage && lastMessage.data.text();

    }
    function sendAuth(password){
        const hash = MD5.generate(password);
        sendMessage(`A${hash}\x00`);
    }
    function banPlayer(name, reason, seconds){
        const ban_props = `${name}\x00${reason}\x00${seconds}`;
        sendMessage(`B${ban_props}\x00`);
    }
    function kickPlayer(name){
        sendMessage(`K${name}\x00`);
    }
    function opPlayer(name){
        sendMessage(`O${name}\x001\x00`);
    }
    function deopPlayer(name){
        sendMessage(`O${name}\x000\x00`);
    }
    function switchState(path){
        sendMessage(`S${state_paths[path]}\x00`);
    }
    return ({
        sendAuth: sendAuth,
        getAnswer: getAnswer,
        banPlayer: banPlayer,
        kickPlayer: kickPlayer,
        opPlayer: opPlayer,
        deopPlayer: deopPlayer,
        switchState: switchState
    })
}

export default CWAP