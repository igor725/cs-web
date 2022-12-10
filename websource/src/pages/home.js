import React from 'react';
import './styles/home.css';
import PlayersList from '../components/PlayersList';
import Statistic from '../components/Statistic';
import Worlds from '../components/Worlds';

const Home = ({ CWAP }) => {
	return (
		<div className='homeMenu'>
			<Statistic cwap={CWAP} />
			<Worlds cwap={CWAP} />
			<PlayersList cwap={CWAP} />
		</div>
	);
}

export default Home;
