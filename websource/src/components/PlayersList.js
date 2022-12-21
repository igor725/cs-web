import { useEffect, useState, useCallback, useRef } from 'react';
import { playersList } from './CWAP/CWAP';
import PlayerDropdown from './PlayerList/PlayerDropdown';
import './styles/PlayersList.css';

export let prevPlayer;

window.onclick = (event) => {
	if (!event.target.matches('.dropbtn')) {
		let dropdowns = document.getElementsByClassName('playerMenu');
		let i;
		for (i = 0; i < dropdowns.length; i++) {
			let openDropdown = dropdowns[i];
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

export let updateGlobalList = () => {};


const PlayersList = ({ cwap }) => {
	const [, updateState] = useState();
	const forceUpdate = useCallback(() => updateState({}), []);
	const plist = useRef(null);

	updateGlobalList = forceUpdate;
	useEffect(() => {
		plist.current.onscroll = () => prevPlayer && prevPlayer.classList.remove('show');
	});

	return (
		<div className='playersOnline'>
			<div>
				<h3>Current online</h3>
			</div>
			<ul id='plist' ref={plist}>
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
