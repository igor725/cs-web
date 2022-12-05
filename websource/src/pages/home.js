import React from 'react';
import './styles/home.css';
import PlayersList from '../components/PlayersList';
import Worlds from '../components/Worlds';

const Home = ({ CWAP }) => {
	return (
		<div className='homeMenu'>
			<Worlds cwap={CWAP} worlds={
				[
					{
						'name': 'world', 
						'status': 'loaded', 
						'size': '128x128x128', 
						'spawn': 'x: 237, y:26', 
						'seed': '1337228', 
						'texturepack': "Default",
						'weather': 'Sunny', 
						'players': ['AetherSmoke', 'igor', 'bebra', 'bebra1', 'bebra2', 'pavel_duroff', 'huy(chinese player)']
					},
					{ 'name': 'wrld3', 'status': 'unloaded', 'players': [] }
				]
			} />
			<PlayersList cwap={CWAP}/>
		</div>
	);
}
export default Home;
