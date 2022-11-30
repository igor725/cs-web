import React from 'react';
import './styles/home.css'
import PlayersList from '../components/PlayersList';
import WebSocket from '../components/WebSocketConnection';

const Home = () => {
    const WSC = WebSocket();
    let [lastMessage, sendMessage] = WSC;

    return(
        <div className='homeMenu'>
            <PlayersList />
        </div>
            
    )
}
export default Home