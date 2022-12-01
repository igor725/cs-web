import React from 'react';
import { MD5 } from "md5-js-tools";
import WebSocket from './WebSocketConnection';

const state_paths = {
    "/home":            "H", 
    "/configeditor":    "C", 
    "/console":         "R", 
    "/pluginmanager":   "E"
}
// ПРОБЕЛ !!! \x00
export function CWAP(){
    const WSC = WebSocket();
    let [sockerUrl, lastMessage, sendMessage] = WSC;

    function getAnswer(){
        return lastMessage
    }

    function sendAuth(password){
        const hash = MD5.generate(password);
        sendMessage(`A\x00${hash}`)
    }
    function banPlayer(name, reason, seconds){
        const ban_props = `${name}\x00${reason}\x00${seconds}`
        sendMessage(`B\x00${ban_props}`)
    }
    function kickPlayer(name){
        sendMessage(`K\x00${name}`)
    }
    function opPlayer(name){
        sendMessage(`O\x00${name}1`)
    }
    function deopPlayer(name){
        sendMessage(`O\x00${name}0`)
    }
    function switchState(path){
        sendMessage(`S\x00${state_paths[path]}`)
    }

    return ([sendAuth, getAnswer, banPlayer, kickPlayer, opPlayer, deopPlayer, switchState])
}
