import React, {useEffect, useState} from 'react';
import PlayerDropdown from './PlayerList/PlayerDropdown';
import './styles/PlayersList.css'

let prev_player;
window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')){
        var dropdowns = document.getElementsByClassName("playerMenu");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }{
        if (prev_player){
            prev_player.style.left = event.clientX + "px"
            prev_player.style.top = event.clientY + "px"
        }
    }
}
function showMenu(e){
    let playerEl = e.currentTarget.parentElement.childNodes[1]
    if ((playerEl !== prev_player) && prev_player){
        prev_player.classList.remove("show")
    }
    playerEl.classList.toggle("show");
    prev_player = playerEl
}

const PlayersList = () => {
    useEffect(()=>{
        const listElement = document.getElementById("plist")
        listElement.onscroll = (e) =>{
            prev_player && prev_player.classList.remove("show")
        }
    })
    const player = <li><b>Player</b> in world <b>WORLD</b></li>
    return(
        <div className='playersOnline'>
            <div>
                <h3>Current online</h3>
                <hr/>
            </div>
            <ul id="plist">
                <PlayerDropdown showMenu={showMenu} world="Tets">KEK</PlayerDropdown>
                {/* <PlayerDropdown showMenu={showMenu}>KEK1</PlayerDropdown>
                <PlayerDropdown showMenu={showMenu}>KEK2</PlayerDropdown>
                <PlayerDropdown showMenu={showMenu}>KEK3</PlayerDropdown>
                <PlayerDropdown showMenu={showMenu}>KEK4</PlayerDropdown>
                <PlayerDropdown showMenu={showMenu}>KEK5</PlayerDropdown>
                <PlayerDropdown showMenu={showMenu}>KEK6</PlayerDropdown>
                <PlayerDropdown showMenu={showMenu}>KEK7</PlayerDropdown>
                <PlayerDropdown showMenu={showMenu}>KEK8</PlayerDropdown>
                <PlayerDropdown showMenu={showMenu}>KEK9</PlayerDropdown>
                <PlayerDropdown showMenu={showMenu}>KEK0</PlayerDropdown>
                <PlayerDropdown showMenu={showMenu}>KEK00</PlayerDropdown>
                <PlayerDropdown showMenu={showMenu}>KEK01</PlayerDropdown>
                <PlayerDropdown showMenu={showMenu}>KEK02</PlayerDropdown>
                <PlayerDropdown showMenu={showMenu}>KEK03</PlayerDropdown>
                <PlayerDropdown showMenu={showMenu}>KEK04</PlayerDropdown>
                <PlayerDropdown showMenu={showMenu}>KEK05</PlayerDropdown> */}

            </ul>
        </div>
    )
}
export default PlayersList