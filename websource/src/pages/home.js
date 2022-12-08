import React from 'react';
import './styles/home.css';
import PlayersList from '../components/PlayersList';
import Statistic from '../components/Statistic';
import Worlds from '../components/Worlds';

const Home = ({ CWAP }) => {
	return (
		<div className='homeMenu'>
			<Worlds cwap={CWAP} />
			<PlayersList cwap={CWAP} />
			<Statistic />
		</div>
	);
}

export default Home;
