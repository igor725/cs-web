import React, { useEffect } from 'react';
import './styles/Worlds.css';
import useHorizontalScroll from "./helpers/horizontalscroll"
import PlayerDropdown from './PlayerList/PlayerDropdown';
import { prev_player } from './PlayersList';

let worldOpened;
let worldOpenedName;

let status;
let size;
let spawn;
let name
let seed;
let textures;
let weather;
let players = [];

const Worlds = props => {
    let worldsInfo = []
    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);
    const World = props => {
        if (!worldsInfo.includes(props)){
            worldsInfo.push(props)
        }
        return (
            <div className='world' name={props.name} style={{ zIndex: props.pos }}>
                <div className={props.status == "unloaded" ? 'worldBG blurry':'worldBG'}></div>
                <h2>{props.name}</h2>
            </div>
        )
    }

    useEffect(() => {
        const listElement = document.getElementById("pList2")
        listElement.onscroll = (e) => {
            prev_player && prev_player.classList.remove("show")
        }
    })
    const scrollRef = useHorizontalScroll();
    const worldsEl = document.getElementsByClassName("worlds")[0]
    function closeExpand(worldsEl) {
        worldsEl.classList.remove("extend")
        worldsEl.classList.add("close")
    }
    function expand(e) {
        if (e.target.className == "worldBG" || e.target.tagName == "H2") {
            const wName = e.target.tagName == "H2" ? e.target.innerHTML : e.target.parentElement.childNodes[1].innerHTML
            players = []
            if (worldOpened) {
                if (worldOpenedName !== wName) {
                    closeExpand(worldsEl);
                    setTimeout(() => {
                        worldsEl.classList.remove("close")
                        worldOpened = true
                        worldOpenedName = wName
                        forceUpdate();
                        worldsEl.classList.add("extend")
                    }, 1500)
                }
                closeExpand(worldsEl);
                setTimeout(() => {
                    worldsEl.classList.remove("close")
                }, 1300)
                worldOpened = undefined
                worldOpenedName = undefined
            } else {
                forceUpdate();
                worldsEl.classList.add("extend")
                worldOpened = true
                worldOpenedName = wName
            }
            return wName;
        }
    }
    return (
        <div className='worlds'>
            <h3>Worlds</h3>
            <hr />
            <div className='worlds_list' onClick={(e)=>{
                let wName = expand(e);
                worldsInfo.forEach((world) => {
                    if (world.name == wName) {
                        world.players.forEach((player)=>{
                            players.push(player)
                        })
                        name = wName
                        size = world.size
                        seed = world.seed
                        weather = world.weather
                        spawn = world.spawn
                        status = world.status
                        if (world.texturepack) {
                            textures = `<a href='${world.texturepack}'>LINK</a>`
                        } else {
                            textures = "Default"
                        }
                    }
                })
            }} ref={scrollRef}>
                {
                    props.worlds.map((world, pos)=>{
                        return <World {...world} pos={pos+1} />
                    })
                }
            </div>
            <div className='worldCart'>
                <div className='worldCart_info'>
                    <h3 id="wName">{name}</h3>
                    <table>
                        <tbody>
                            <tr>
                                <th style={{ textAlign: "right" }}>Status: </th>
                                <th id="wStatus" style={{ textAlign: "left" }}>{status}</th>
                            </tr>
                            <tr>
                                <th style={{ textAlign: "right" }}>Size: </th>
                                <th id="wSize" style={{ textAlign: "left" }}>{size}</th>
                            </tr>
                            <tr>
                                <th style={{ textAlign: "right" }}>Spawn: </th>
                                <th id="wSpawn" style={{ textAlign: "left" }}>{spawn}</th>
                            </tr>
                            <tr>
                                <th style={{ textAlign: "right" }}>Seed: </th>
                                <th id="wSeed" style={{ textAlign: "left" }}>{seed}</th>
                            </tr>
                            <tr>
                                <th style={{ textAlign: "right" }}>Textures: </th>
                                <th id="wTexturePack" style={{ textAlign: "left" }}>{textures}</th>
                            </tr>
                            <tr>
                                <th style={{ textAlign: "right" }}>Weather: </th>
                                <th id="wWeather" style={{ textAlign: "left" }}>{weather}</th>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className='worldCart_players'>
                    <h3 id="wName">Players</h3>
                    <ul className='plist' id="pList2">
                        { players.map((player)=>{
                           return <PlayerDropdown cwap={props.cwap}>{player}</PlayerDropdown>
                        })}
                    </ul>
                </div>
            </div>
        </div>
    )
}
export default Worlds