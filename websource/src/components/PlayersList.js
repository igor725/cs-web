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
	if ((playerEl !== prev_player) && prev_player) {
		prev_player.classList.remove('show');
	}
	playerEl.classList.toggle('show');
	prev_player = playerEl;
};

export let updateGlobalList = () => {}


let playersList = [];
const PlayersList = ({ cwap }) => {
	const [, updateState] = React.useState();
	const forceUpdate = React.useCallback(() => updateState({}), []);
	
	updateGlobalList = () =>{
		forceUpdate();
	}

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
				{
					playersList.map((player)=>{
						return (
							<PlayerDropdown 
								id={player.id} 
								world={player.world} 
								isAdmin={player.isAdmin} 
								cwap={cwap}
							>{player.name}</PlayerDropdown>
						)
					})
				}
			</ul>
		</div>
	);
};

export default PlayersList;
