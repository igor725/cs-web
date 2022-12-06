import React, { useState, useEffect } from 'react';
import './styles/Navbar.css';
import { Link, useLocation } from 'react-router-dom';
import { DarkModeToggle } from 'react-dark-mode-toggle-2';

let prev_colored;
const Navbar = props => {
	const DARKMODE_STATE = (window.localStorage.getItem('DARKMODE_STATE') === 'true') || false;
	const [isDarkMode, setIsDarkMode] = useState(DARKMODE_STATE);

	window.localStorage.setItem('DARKMODE_STATE', isDarkMode);

	const currentLocation = useLocation().pathname;

	useEffect(() => {
		if (prev_colored){
			prev_colored.className = "";
		}
		var els = document.querySelectorAll(`a[href='${currentLocation}']`)[0];
		if ((els !== undefined)) {
			if (isDarkMode){
				els.classList.add('red');
			} else{
				els.classList.add("selected")
			}
			prev_colored = els;
		}
	});

	return (
		<div className={((window.localStorage.getItem('DARKMODE_STATE') === 'true') || false) ? 'navbar' : 'navbar light'}>
			<div style={{ width: '4px', background: 'red' }} title='WebSocket connection: ' className='websocketStatus' />
			<h3 style={{ cursor: 'pointer' }}>CServer Webadmin</h3>
			<div className='buttons' onClick={(e) => {
				const target = e.target
				if (target.tagName === 'A') {
					const path = target.getAttribute('href');
					props.CWAP.switchState(path);
				}
			}}
			>
				<Link to='/'> Home </Link>
				<Link to='/console'> Terminal </Link>
				<Link to='/configeditor'> Config Editor </Link>
				<Link to='/pluginmanager'> Plugin Manager</Link>
				<DarkModeToggle
					onChange={() => { setIsDarkMode(!isDarkMode); props.setTheme() }}
					isDarkMode={isDarkMode}
					className='night_btn'
					size={50}
				/>
			</div>
		</div>
	);
};

export default Navbar;
