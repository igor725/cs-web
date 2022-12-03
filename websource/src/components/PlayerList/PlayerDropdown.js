import React from 'react';
import './styles/PlayerDropdown.css'
import { showMenu } from '../PlayersList';

const PlayerDropdown = props => {
    const playerName = props.children;
    const playerWorld = props.world
    const isAdmin = props.isAdmin || false
    return(
        <div className="playerDropdown" name={playerName}>
            <li>
                <p style={{display: 'contents'}} 
                onClick={showMenu}>
                        <b style={{cursor: "pointer", color: isAdmin ? "red":""}} className="dropbtn" name={playerName}>{playerName}</b> in world <b>{playerWorld}</b>
                </p>
                <div className="playerMenu">
                    <button className='ban' style={{cursor: isAdmin ? "":"pointer"}} {...isAdmin && {disabled: true}}> Ban </button>
                    <button className='kick' style={{cursor: isAdmin ? "":"pointer"}} {...isAdmin && {disabled: true}}> Kick </button>
                </div>
            </li>
        </div>
    )
}
export default PlayerDropdown