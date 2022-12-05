import React, { useEffect } from 'react';
import './styles/Worlds.css';
import PlayerDropdown from './PlayerList/PlayerDropdown';
import { prev_player } from './PlayersList';

let worldOpened;
let worldOpenedName;

export let closeWorld = () =>{
	worldOpened = false
}

const Worlds = props => {
	let worldsEl
	let worldsInfo = [];
	const [, updateState] = React.useState();
	const forceUpdate = React.useCallback(() => updateState({}), []);
	const World = props => {
		if (!worldsInfo.includes(props)) worldsInfo.push(props);
		return (
			<div className='world-grid'>
				<div className='world' name={props.name} style={{ zIndex: props.pos }}>
					<div className={props.status === 'unloaded' ? 'worldBG blurry' : 'worldBG'}></div>
					<h2>{props.name}</h2>
				</div>
				<div className='worldCart_info'>
					<h3 id='wName'></h3>
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
						{ props.players.map((player) => {
						   return <PlayerDropdown cwap={props.cwap}>{player}</PlayerDropdown>
						})}
					</ul>
				</div>
			</div>
		);
	};

	useEffect(() => {
		const listElement = document.getElementById('pList2');
		worldsEl = document.getElementsByClassName('worlds')[0];
		listElement.onscroll = (e) => prev_player && prev_player.classList.remove('show');
	});
	const closeExpand = (worldsEl) => {
		worldsEl.classList.remove('extend');
		worldsEl.classList.add('close');
	}
	const expand = (e) => {
		if (e.target.className === 'worldBG' || e.target.tagName === 'H2') {
			const wName = e.target.tagName === 'H2' ? e.target.innerHTML : e.target.parentElement.childNodes[1].innerHTML;
			if (worldOpened) {
				if (worldOpenedName !== wName) {
					closeExpand(worldsEl);
					setTimeout(() => {
						worldsEl.classList.remove('close');
						worldOpened = true
						worldOpenedName = wName
						forceUpdate();
						worldsEl.classList.add('extend');
					}, 1500);
				}
				closeExpand(worldsEl);
				setTimeout(() => {
					worldsEl.classList.remove('close');
				}, 1300);
				worldOpened = undefined;
				worldOpenedName = undefined;
			} else {
				forceUpdate();
				worldsEl.classList.add('extend');
				worldOpened = true;
				worldOpenedName = wName;
			}
			return wName;
		}
	}

	return (
		<div className='worlds'>
			<h3 className='worlds-header'>Worlds</h3>
			<hr />
			<div className='worlds_list'>
				{
					props.worlds.map((world, pos) => {
						return <World {...world} pos={pos+1} />
					})
				}
			</div>
		</div>
	);
}

export default Worlds;
