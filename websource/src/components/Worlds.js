import React, { useEffect } from 'react';
import './styles/Worlds.css';
import { playersList } from './CWAP/CWAP';
import PlayerDropdown from './PlayerList/PlayerDropdown';
import { prev_player } from './PlayersList';

export let updateWorlds = () => {}

const World = props => {
	const cwap = props.cwap;
	return (
		<div className='world-grid'>
			<div className='world' name={props.name} style={{ zIndex: props.pos }}>
				<div className={props.status === 'unloaded' ? 'worldBG blurry' : 'worldBG'}></div>
				<h2>{props.name}</h2>
			</div>
			<div className='worldCart_info'>
				<table>
					<tbody>
						<tr>
							<td>Status: </td>
							<td id='wStatus'>{props.status}</td>
						</tr>
						<tr>
							<td>Size: </td>
							<td id='wSize'>{props.size}</td>
						</tr>
						<tr>
							<td>Spawn: </td>
							<td id='wSpawn'>{props.spawn}</td>
						</tr>
						<tr>
							<td>Seed: </td>
							<td id='wSeed'>{props.seed}</td>
						</tr>
						<tr>
							<td>Textures: </td>
							<td id='wTexturePack'>{props.texturepack}</td>
						</tr>
						<tr>
							<td>Weather: </td>
							<td id='wWeather'>{props.weather}</td>
						</tr>
					</tbody>
				</table>
			</div>
			<div className='worldCart_players'>
				<h3 id='wName'>Players</h3>
				<ul className='plist' id='pList2'>
					{ playersList.map((player)=>{
						if (player.world === props.name){
							return (
								<PlayerDropdown 
									id={player.id}
									isAdmin={player.isAdmin} 
									cwap={cwap}
								>{player.name}</PlayerDropdown>
							)
						}
					})}
				</ul>
			</div>
		</div>
	);
};

const Worlds = props => {
	const [, updateState] = React.useState();
	const forceUpdate = React.useCallback(() => updateState({}), []);
	const cwap = props.cwap;
	updateWorlds = () => {
		forceUpdate();
	}
	useEffect(() => {
		const listElement = document.getElementById('pList2');
		listElement.onscroll = (e) => prev_player && prev_player.classList.remove('show');
	});

	return (
		<div className='worlds'>
			<h3 className='worlds-header'>Worlds</h3>
			<hr />
			<div className='worlds_list'>
				{
					props.worlds.map((world, pos) => {
						return <World cwap={props.cwap} {...world} pos={pos+1} />
					})
				}
			</div>
		</div>
	);
}

export default Worlds;
