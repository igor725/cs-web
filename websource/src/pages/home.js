import React from 'react';
import './styles/home.css';
import PlayersList from '../components/PlayersList';
import Statistic from '../components/Statistic';
import Worlds from '../components/Worlds';

const Home = ({ CWAP }) => {
	return (
		<div className='homeMenu'>
			<Statistic />
			<PlayersList cwap={CWAP} />
			<Worlds cwap={CWAP} />
		</div>
	);
}
export default Home;
