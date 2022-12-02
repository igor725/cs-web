import React, {useEffect} from 'react';
import './styles/Worlds.css';
import useHorizontalScroll from "./helpers/horizontalscroll"

// import world from '../public/world_template.png'
let worldsInfo = []
const World = props => {
    const wName = props.name;
    const wSize = props.size;
    const wSeed = props.seed;
    const wWeather = props.weather;
    const wTexturePack = props.texturepack;
    const wSpawn = props.spawn;
    const wIsLoaded = props.loaded;
    worldsInfo.push(props)

    return(
        <div className='world' style={{zIndex: props.pos}}>
            <div className='worldBG'></div>
            <h2>{wName}</h2>
        </div>
    )
}
let worldOpened;
let worldOpenedName;
const Worlds = props => {
    const scrollRef = useHorizontalScroll();
    const worldsEl = document.getElementsByClassName("worlds")[0]

    const wName_el = document.getElementById("wName")
    const wSeed_el = document.getElementById("wSeed")
    const wSize_el = document.getElementById("wSize")
    const wWeather_el = document.getElementById("wWeather")
    const wTexturePack_el = document.getElementById("wTexturePack")
    const wSpawn_el = document.getElementById("wSpawn")
    const wIsLoaded_el = document.getElementById("wIsLoaded")

    function closeExpand(worldsEl){
        worldsEl.classList.remove("extend")
        worldsEl.classList.add("close")
    }
    function writeInfo(wName){
        worldsInfo.forEach((world)=>{
            if (world.name == wName){
                wName_el.innerHTML = wName
                wSize_el.innerHTML = world.wSize
                wSeed_el.innerHTML = world.wSeed
                wWeather_el.innerHTML = world.wWeather
                wTexturePack_el.innerHTML = world.wTexturePack
                wSpawn_el.innerHTML = world.wSpawn
                wIsLoaded_el.innerHTML = world.wIsLoaded
            }
        })
    }
    function expand(e){
        if (e.target.className == "worldBG" || e.target.tagName == "H2"){
            const wName = e.target.tagName == "H2" ? e.target.innerHTML : e.target.parentElement.childNodes[1].innerHTML
            if (worldOpened){
                if( worldOpenedName !== wName){
                    closeExpand(worldsEl)
                    setTimeout(()=>{
                        worldsEl.classList.remove("close")
                        worldOpened = true
                        worldOpenedName = wName
                        worldsEl.classList.add("extend")
                        writeInfo(wName)
                    }, 1500)
                }
                closeExpand(worldsEl)
                setTimeout(()=>{
                    worldsEl.classList.remove("close")
                }, 1300)
                worldOpened = undefined
                worldOpenedName = undefined
            } else{
                worldsEl.classList.add("extend")
                writeInfo(wName)
                worldOpened = true
                worldOpenedName = wName
            }
        }
    }
    return(
        <div className='worlds'>
            <h3>Worlds</h3>
            <hr/>
            <div className='worlds_list' onClick={expand} ref={scrollRef}>
                <World name="world" pos={1}/>
                <World name="world2"pos={2}/>
                <World name="world3"pos={3}/>
                <World name="world4"pos={4}/>
                <World name="world5"pos={5}/>
            </div>
            <div className='worldCart'>
                <h3 id="wName">World Name</h3>
                <table>
                    <tr>
                        <th style={{textAlign: "right"}}>Loaded: </th>
                        <th id="wIsLoaded"></th>
                    </tr>
                    <tr>
                        <th style={{textAlign: "right"}}>Size: </th>
                        <th id="wSize"></th>
                    </tr>
                    <tr>
                        <th style={{textAlign: "right"}}>Seed: </th>
                        <th id="wSeed"></th>
                    </tr>
                    <tr>
                        <th style={{textAlign: "right"}}>Weather: </th>
                        <th id="wWeather"></th>
                    </tr>
                    <tr>
                        <th style={{textAlign: "right"}}>Texture Pack: </th>
                        <th id="wTexturePack"></th>
                    </tr>
                    <tr>
                        <th style={{textAlign: "right"}}>Spawn coords: </th>
                        <th id="wSpawn"></th>
                    </tr>
                </table>
            </div>
        </div>
    )
}
export default Worlds