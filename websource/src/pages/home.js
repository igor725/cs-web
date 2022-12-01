import React from 'react';
import './styles/home.css'
import PlayersList from '../components/PlayersList';
import {CWAP} from '../components/CWAP/CWAP';

const Home = () => {
    const cwap = CWAP()
    const [sendAuth, getAnswer, banPlayer, kickPlayer, opPlayer, deopPlayer, switchState] = cwap
    console.log(getAnswer())
    return(
        <div className='homeMenu'>
            <PlayersList />
            <button onClick={()=>sendAuth("1211")}>SEND AUTH</button>
            <button onClick={()=>opPlayer("AetherSmoke")}>SEND OP</button>
            <button onClick={()=>banPlayer("igor1", "loh", "1337228")}>SEND KICK</button>
            <button onClick={()=>switchState("/home")}>SEND SWITCH STATE</button>
        </div>
    )
}
export default Home