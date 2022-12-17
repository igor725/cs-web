import { useEffect, useState, useCallback } from 'react';
import { playersList } from './CWAP/CWAP';
import PlayerDropdown from './PlayerList/PlayerDropdown';
import './styles/PlayersList.css';

export let prevPlayer;

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
};

export let showMenu = (e) => {
	let playerEl = e.currentTarget.parentElement.childNodes[1];
	if ((playerEl !== prevPlayer) && prevPlayer) {
		prevPlayer.classList.remove('show');
	}

	playerEl.style.left = e.pageX + 'px';
	playerEl.style.top = e.pageY + 'px';

	playerEl.classList.toggle('show');
	prevPlayer = playerEl;
};

export let updateGlobalList = () => {}


const PlayersList = ({ cwap }) => {
	const [, updateState] = useState();
	const forceUpdate = useCallback(() => updateState({}), []);
	updateGlobalList = forceUpdate;

	useEffect(() => {
		document.getElementById('plist').onscroll = (e) => prevPlayer && prevPlayer.classList.remove('show');
	});

	return (
		<div className='playersOnline'>
			<div>
				<h3>Current online</h3>
			</div>
			<ul id='plist'>
				{
					playersList.map((player) => {
						return (
							<PlayerDropdown
								key={player.id}
								id={player.id}
								world={player.world}
								isAdmin={player.isAdmin}
								cwap={cwap}
							>{player.name}</PlayerDropdown>
						);
					})
				}
			</ul>
		</div>
	);
};

export default PlayersList;
