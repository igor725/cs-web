import React, { useEffect } from 'react';
import PlayerDropdown from './PlayerList/PlayerDropdown';
import './styles/PlayersList.css'

export let prev_player;
window.onclick = function (event) {
    if (!event.target.matches('.dropbtn')) {
        var dropdowns = document.getElementsByClassName("playerMenu");
        var i;
        for (i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    } {
        if (prev_player) {
            prev_player.style.left = event.clientX + "px"
            prev_player.style.top = event.clientY + "px"
        }
    }
}
export function showMenu(e) {
    let playerEl = e.currentTarget.parentElement.childNodes[1]
    const playerName = playerEl.parentElement.childNodes[0].childNodes[0].getAttribute("name")
    if ((playerEl !== prev_player) && prev_player) {
        prev_player.classList.remove("show")
    }
    playerEl.classList.toggle("show");
    prev_player = playerEl
}

const PlayersList = () => {
    useEffect(() => {
        const listElement = document.getElementById("plist")
        listElement.onscroll = (e) => {
            prev_player && prev_player.classList.remove("show")
        }
    })
    return (
        <div className='playersOnline'>
            <div>
                <h3>Current online</h3>
                <hr />
            </div>
            <ul id="plist">
                <PlayerDropdown world="Tets">KEK</PlayerDropdown>
                <PlayerDropdown>KEK1</PlayerDropdown>
                <PlayerDropdown>KEK2</PlayerDropdown>
                <PlayerDropdown>KEK3</PlayerDropdown>
                <PlayerDropdown>KEK4</PlayerDropdown>
                <PlayerDropdown>KEK5</PlayerDropdown>
                <PlayerDropdown>KEK6</PlayerDropdown>
                <PlayerDropdown>KEK7</PlayerDropdown>
                <PlayerDropdown>KEK8</PlayerDropdown>
                <PlayerDropdown>KEK9</PlayerDropdown>
                <PlayerDropdown>KEK0</PlayerDropdown>
                <PlayerDropdown>KEK00</PlayerDropdown>
                <PlayerDropdown>KEK01</PlayerDropdown>
                <PlayerDropdown>KEK02</PlayerDropdown>
                <PlayerDropdown>KEK03</PlayerDropdown>
                <PlayerDropdown>KEK04</PlayerDropdown>
                <PlayerDropdown>KEK05</PlayerDropdown>

            </ul>
        </div>
    )
}
export default PlayersList