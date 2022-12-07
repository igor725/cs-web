import React from 'react';
import './styles/home.css';
import PlayersList from '../components/PlayersList';
import Worlds from '../components/Worlds';

const Home = ({ CWAP }) => {
	return (
		<div className='homeMenu'>
			<Worlds cwap={CWAP} />
			<PlayersList cwap={CWAP}/>
		</div>
	);
}
export default Home;
