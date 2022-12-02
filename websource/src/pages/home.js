import React, { useEffect } from 'react';
import './styles/home.css'
import PlayersList from '../components/PlayersList';
import CWAP from '../components/CWAP/CWAP';
import Worlds from '../components/Worlds';

const Home = () => {
    let cwap = CWAP()
    cwap.getAnswer().then((data)=>console.log(data))
    return(
        <div className='homeMenu'>
            <Worlds/>
            {/* <Stats/> */}
            <PlayersList />
            {/* <button onClick={()=>{
                cwap.sendAuth("huihuihuihuihuihuihuihuihuihuihu");
        }}>SEND AUTH</button>
            <button onClick={()=>cwap.opPlayer("AetherSmoke")}>SEND OP</button>
            <button onClick={()=>cwap.banPlayer("igor1", "loh", "1337228")}>SEND KICK</button>
            <button onClick={()=>cwap.switchState("/home")}>SEND SWITCH STATE</button> */}
        </div>
    )
}
export default Home