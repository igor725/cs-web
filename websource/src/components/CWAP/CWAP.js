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
    async function getAnswer(){
        if (lastMessage){
            return await lastMessage.data.text()
        }
    }
    function sendAuth(password){
        // const hash = MD5.generate(password);
        // sendMessage(`A${hash}\x00`)
        sendMessage(`Ahuihuihuihuihuihuihuihuihuihuihu\x00`)
        // return (getAnswer())
    }
    function banPlayer(name, reason, seconds){
        const ban_props = `${name}\x00${reason}\x00${seconds}`
        sendMessage(`B${ban_props}\x00`)
    }
    function kickPlayer(name){
        sendMessage(`K${name}\x00`)
    }
    function opPlayer(name){
        sendMessage(`O${name}\x001\x00`)
    }
    function deopPlayer(name){
        sendMessage(`O${name}\x000\x00`)
    }
    function switchState(path){
        sendMessage(`S${state_paths[path]}\x00`)
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