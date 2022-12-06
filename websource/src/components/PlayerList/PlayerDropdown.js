import React from 'react';
import './styles/PlayerDropdown.css';
import { showMenu } from '../PlayersList';

const PlayerDropdown = props => {
	const playerId = props.id
	const playerName = props.children;
	const playerWorld = props.world;
	const isAdmin = props.isAdmin || false;
	const cwap = props.cwap;

	const opPlayer = (playerName) =>{
		cwap.opPlayer(playerName)
	}
	
	const deopPlayer = (playerName) => {
		cwap.deopPlayer(playerName)
	}

	return (
		<div className='playerDropdown' name={playerId}>
			<li>
				<p style={{display: 'contents'}} 
				onClick={showMenu}>
						<b className={'dropbtn ' + (isAdmin ? "admin":"")} name={playerName}>{playerName}</b> in world <b>{playerWorld}</b>
				</p>
				<div className='playerMenu'>
					<button className='ban' onClick={()=> cwap.banPlayer(playerName)}> Ban </button>
					<button className='kick' onClick={() => cwap.kickPlayer(playerName)}> Kick </button>
					<button className='op' onClick={isAdmin ? deopPlayer : opPlayer}>{isAdmin ? "de-op" : "OP"}</button>
				</div>
			</li>
		</div>
	);
}

export default PlayerDropdown
