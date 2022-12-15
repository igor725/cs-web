import React from 'react';
import './PlayerDropdown.css';
import { showMenu } from '../PlayersList';

const PlayerDropdown = props => {
	const playerId = props.id
	const playerName = props.children;
	const playerWorld = props.world;
	const isAdmin = Boolean(props.isAdmin);
	const cwap = props.cwap;

	return (
		<div className='playerDropdown' name={playerId}>
			<li>
				<p style={{display: 'contents'}}
				onClick={showMenu}>
						<b className={'dropbtn ' + (isAdmin ? 'admin':'')} style={{fontFamily: 'NunitoExtraBold'}}name={playerName}>{playerName}</b> in world <b>{playerWorld}</b>
				</p>
				<div className='playerMenu'>
					<button className='ban' onClick={() => cwap.banPlayer(playerName)}> Ban </button>
					<button className='kick' onClick={() => cwap.kickPlayer(playerId)}> Kick </button>
					<button className='op' onClick={
						() => cwap[isAdmin ? 'deopPlayer' : 'opPlayer'](playerName)
					}
					>{isAdmin ? 'de-op' : 'op'}</button>
				</div>
			</li>
		</div>
	);
};

export default PlayerDropdown;
