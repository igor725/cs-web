import React, { useEffect } from 'react';
import './styles/home.css'
import PlayersList from '../components/PlayersList';
import CWAP from '../components/CWAP/CWAP';
import Worlds from '../components/Worlds';

const Home = () => {
    let cwap = CWAP()
    // cwap.getAnswer().then((data)=>console.log(data))
    return (
        <div className='homeMenu'>
            <Worlds worlds={ 
                [
                    {"name": "world", "status": "loaded", "size": "128x128x128", "spawn": "x: 237, y:26", "seed": "1337228", "weather":"Sunny", "players":['AetherSmoke', 'igor']}, 
                    {"name": "wrld3", "status":"unloaded", "players": []}
                ] 
            }/>
            {/* <Stats/> */}
            <PlayersList />
            <button onClick={() => {
                cwap.sendAuth("test");
            }}>SEND AUTH</button>
            <button onClick={() => cwap.opPlayer("AetherSmoke")}>SEND OP</button>
            <button onClick={() => cwap.banPlayer("igor1", "loh", "1337228")}>SEND KICK</button>
            <button onClick={() => cwap.switchState("/home")}>SEND SWITCH STATE</button>
        </div>
    )
}
export default Home