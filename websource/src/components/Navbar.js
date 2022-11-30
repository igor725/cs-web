import React, {useState} from 'react'
import './styles/Navbar.css'
import { Link } from 'react-router-dom'
import DarkModeToggle from "react-dark-mode-toggle";

let prev_elem;
function changeColor(e){
    let elem = e.target
    elem.classList.add("red");
    prev_elem && prev_elem !== elem && prev_elem.classList.remove("red");
    prev_elem = elem;
}

const Navbar = () => {
    const [isDarkMode, setIsDarkMode] = useState(() => false);
    return(
        <div className = "navbar">
            <h3 style={{cursor: "default"}}>CServer Webadmin</h3>
            <div className="buttons" onClick={changeColor}>
                <Link to='/'> Home </Link>
                <Link to='/cfgeditor'> CFG Editor </Link>
                <Link to='/luaconsole'> Lua Console </Link>
                <Link to='/pluginmanager'> Plugin Manager</Link>
                <div className='night_btn'>
                    <DarkModeToggle
                        onChange={setIsDarkMode}
                        checked={isDarkMode}
                        size={50}
                    />
                </div>
            </div>
        </div>
    )
}

export default Navbar