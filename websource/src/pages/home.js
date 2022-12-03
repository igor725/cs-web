import React from 'react';
import './styles/home.css'
import PlayersList from '../components/PlayersList';
import Worlds from '../components/Worlds';

const Home = ({ CWAP }) => {
    return (
        <div className='homeMenu'>
            <Worlds cwap = {CWAP} worlds={
                [
                    {
                        "name": "world", 
                        "status": "loaded", 
                        "size": "128x128x128", 
                        "spawn": "x: 237, y:26", 
                        "seed": "1337228", 
                        "weather": "Sunny", 
                        "players": ['AetherSmoke', 'igor']
                    },
                    { "name": "wrld3", "status": "unloaded", "players": [] }
                ]
            } />
            {/* <Stats/> */}
            <PlayersList cwap={CWAP}/>
            <div className="stat">
                <button onClick={() => CWAP.sendAuth("test")}>SEND AUTH</button>
                <button onClick={() => CWAP.opPlayer("AetherSmoke")}>SEND OP</button>
                <button onClick={() => CWAP.banPlayer("igor1")}>SEND KICK</button>
                <button onClick={() => CWAP.switchState("/")}>SEND SWITCH STATE</button>
                <button onClick={() => CWAP._sendMessage("F")}>SEND FUCK</button>
            </div>
        </div>
    )
}
export default Home