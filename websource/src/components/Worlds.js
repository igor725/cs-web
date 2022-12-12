import React, { useEffect } from 'react';
import './styles/Worlds.css';
import { playersList, worldsList } from './CWAP/CWAP';
import PlayerDropdown from './PlayerList/PlayerDropdown';
import { prev_player } from './PlayersList';
import Fancyselect from './fancyselect/fancyselect';

export let updateWorlds = () => {}

const wTypes = {
	0: '🌤️Sunny',
	1: '🌧️Raining',
	2: '🌨️Snowing'
}

const World = props => {
	const cwap = props.cwap;
	const changeWeather = (e) => {
		Object.entries(wTypes).every(([key,value]) => {
			if (value === e.target.value) {
				cwap.changeWeather(props.id, key);
				return false;
			}
			return true;
		});
	}
	return (
		<div className='world-grid'>
			<div className='world' name={props.id} style={{ zIndex: props.pos }}>
				<div className={props.status === 0 ? 'worldBG blurry' : 'worldBG'}></div>
				<h2>{props.id}</h2>
			</div>
			<div className='worldCart_info'>
				<table>
					<tbody>
						<tr>
							<td>Status: </td>
							<td>{Boolean(props.status) ? 'Loaded':'Unloaded'}</td>
						</tr>
						<tr>
							<td>Size: </td>
							<td>{props.size}</td>
						</tr>
						<tr>
							<td>Spawn: </td>
							<td>{props.spawn}</td>
						</tr>
						<tr>
							<td>Textures: </td>
							<td>{props.texturepack}</td>
						</tr>
						<tr>
							<td>Weather: </td>
							<td>
								<Fancyselect value={wTypes[props.weather]} onChange={changeWeather}>
									{
										Object.entries(wTypes).map(([key,value]) => {
											return (
												<option key={key} value={value}>
													{value}
												</option>
											);
										})
									}
								</Fancyselect>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<div className='worldCart_players'>
				<h4 id='wName'>Players</h4>
				<ul className='plist' id='pList2'>
					{ playersList.map((player) => {
						if (player.world === props.id) {
							return (
								<PlayerDropdown
									key={player.id}
									id={player.id}
									isAdmin={player.isAdmin}
									cwap={cwap}
								>{player.name}</PlayerDropdown>
							);
						}

						return null;
					})}
				</ul>
			</div>
		</div>
	);
};

const Worlds = props => {
	const [, updateState] = React.useState();
	const forceUpdate = React.useCallback(() => updateState({}), []);
	updateWorlds = forceUpdate;
	const cwap = props.cwap;

	useEffect(() => {
		const listElement = document.getElementById('pList2');
		if (worldsList.length > 0){
			listElement.onscroll = (e) => prev_player && prev_player.classList.remove('show');
		}
	});

	return (
		<div className='worlds'>
			<div className='worlds-header-main'>
				<h3 className='worlds-header'>Worlds</h3>
				<hr />
			</div>
			<div className='worlds_list'>
				{
					worldsList.map((world, i) => <World cwap={cwap} {...world} key={i} pos={i+1} />)
				}
			</div>
		</div>
	);
}

export default Worlds;
