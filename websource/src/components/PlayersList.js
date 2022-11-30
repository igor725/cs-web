import React, {useEffect, useState} from 'react';
import './styles/PlayersList.css'

const PlayersList = () => {
    const player = <li><b>Player</b> in world <b>WORLD</b></li>
    return(
        <div className='playersOnline'>
            <h3>Current online</h3>
            <hr style={{width: "100%"}}/>
            <ul>
                {player}
                <li><b>Player123123123123123</b> in world <b>WORLD</b></li>
                {player}
                {player}
                {player}
                {player}
                {player}
                {player}
                {player}
                {player}
                {player}
                {player}
            </ul>
        </div>
    )
}
export default PlayersList