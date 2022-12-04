import React, { useEffect } from 'react';
import PlayerDropdown from './PlayerList/PlayerDropdown';
import './styles/PlayersList.css';

export let prev_player;

window.onclick = (event) => {
	if (!event.target.matches('.dropbtn')) {
		var dropdowns = document.getElementsByClassName('playerMenu');
		var i;
		for (i = 0; i < dropdowns.length; i++) {
			var openDropdown = dropdowns[i];
			if (openDropdown.classList.contains('show')) {
				openDropdown.classList.remove('show');
			}
		}
	}

	if (prev_player) {
		prev_player.style.left = event.clientX + 'px';
		prev_player.style.top = event.clientY + 'px';
	}
};

export let showMenu = (e) => {
	let playerEl = e.currentTarget.parentElement.childNodes[1];
	// const playerName = playerEl.parentElement.childNodes[0].childNodes[0].getAttribute('name');
	if ((playerEl !== prev_player) && prev_player) {
		prev_player.classList.remove('show');
	}
	playerEl.classList.toggle('show');
	prev_player = playerEl;
};

const PlayersList = ({ cwap }) => {
	useEffect(() => {
		document.getElementById('plist').onscroll = (e) => {
			prev_player && prev_player.classList.remove('show');
		}
	});

	return (
		<div className='playersOnline'>
			<div>
				<h3>Current online</h3>
				<hr />
			</div>
			<ul id='plist'>
				<PlayerDropdown cwap={cwap} world='Tets'>KEK</PlayerDropdown>
				<PlayerDropdown cwap={cwap} >KEK1</PlayerDropdown>
				<PlayerDropdown cwap={cwap} >KEK2</PlayerDropdown>
				<PlayerDropdown cwap={cwap} >KEK3</PlayerDropdown>
				<PlayerDropdown cwap={cwap} >KEK4</PlayerDropdown>
				<PlayerDropdown cwap={cwap} >KEK5</PlayerDropdown>
				<PlayerDropdown cwap={cwap} >KEK6</PlayerDropdown>
				<PlayerDropdown cwap={cwap} >KEK7</PlayerDropdown>
				<PlayerDropdown cwap={cwap} >KEK8</PlayerDropdown>
				<PlayerDropdown cwap={cwap} >KEK9</PlayerDropdown>
				<PlayerDropdown cwap={cwap} >KEK0</PlayerDropdown>
				<PlayerDropdown cwap={cwap} >KEK00</PlayerDropdown>
				<PlayerDropdown cwap={cwap} >KEK01</PlayerDropdown>
				<PlayerDropdown cwap={cwap} >KEK02</PlayerDropdown>
				<PlayerDropdown cwap={cwap} >KEK03</PlayerDropdown>
				<PlayerDropdown cwap={cwap} >KEK04</PlayerDropdown>
				<PlayerDropdown cwap={cwap} >KEK05</PlayerDropdown>

			</ul>
		</div>
	);
};

export default PlayersList;
