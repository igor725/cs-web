import React, { useState, useEffect } from 'react';
import './styles/Navbar.css';
import { Link, useLocation } from 'react-router-dom';
import { DarkModeToggle } from 'react-dark-mode-toggle-2';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid, regular } from '@fortawesome/fontawesome-svg-core/import.macro';

let prev_colored;
let isOpened = false;
let transition;

const Navbar = props => {
	const DARKMODE_STATE = (window.localStorage.getItem('DARKMODE_STATE') === 'true') || false;
	const [isDarkMode, setIsDarkMode] = useState(DARKMODE_STATE);

	window.localStorage.setItem('DARKMODE_STATE', isDarkMode);
	const currentLocation = useLocation().pathname;
	const isMobile = (window.screen.width <= 600);
	const navbar_btns = document.getElementsByClassName('buttons')[0];
	const open_btn = document.getElementById('navbar-mobile-btn');
	const root = document.querySelector(':root');

	const openNavbar = () => {
		open_btn.classList.toggle('navbar-open');
		setTimeout(() => open_btn.classList.toggle('navbar-btn-pressed'), 500);
		if (isOpened){
			navbar_btns.classList.add('hide-navbar');
			setTimeout(()=>navbar_btns.classList.remove('hide-navbar', 'show-navbar'), 300);
			isOpened = false;
		} else {
			navbar_btns.classList.add('show-navbar');
			isOpened = true;
		}
	};

	const processLink = (e) => {
		const target = e.target;
		const path = target.getAttribute('href');
		if (target.tagName === 'A' && props.CWAP.switchState(path)) {
			isMobile && openNavbar();

			const childs = target.parentNode.childNodes;
			const prevIdx = Array.prototype.findIndex.call(childs, (el, idx, arr) => {
				if (el.classList.contains(isDarkMode ? 'selected-dark' : 'selected'))
					return true;
			});
			const idx = Array.prototype.indexOf.call(childs, target);

			const moveTo = idx > prevIdx ? 'left' : 'right';
			const moveToOpposite = idx < prevIdx ? 'left' : 'right';
			
			root.style.setProperty('--navbar-from-dir', moveToOpposite);
			root.style.setProperty('--navbar-to-dir', moveTo);
			
			if (transition) clearTimeout(transition);
			setTimeout(()=>{
				childs[prevIdx].classList.add('anim-backwards');
				root.style.setProperty('--back-from-dir', moveToOpposite);
				root.style.setProperty('--back-to-dir', moveTo);
				transition = setTimeout(() => {
					childs[prevIdx].className = ''; 
					transition = null;
				}, 1000)
			}, 0); // таймаут нужен тут потому что потому, не пытайся его убирать,
			return;// он просто перестанет работать, проверенно. Особенности жс? можеш погуглить¯\_(ツ)_/¯
		}

		e.preventDefault();
	};

	useEffect(() => {
		if (prev_colored) prev_colored.className = '';
		var els = document.querySelectorAll(`a[href='${currentLocation}']`)[0];
		if (els !== undefined) {
			if (isDarkMode){
				els.classList.add('selected-dark', 'anim-forwards');
			} else{
				els.classList.add('selected', 'anim-forwards');
			}
			prev_colored = els;
		}
	});

	return (
		<div className={((window.localStorage.getItem('DARKMODE_STATE') === 'true') || false) ? 'navbar' : 'navbar light'}>
			{(isMobile) && (
				<div className='navbar-head'>
					<FontAwesomeIcon id='navbar-mobile-btn' icon={regular('square-caret-down')} onClick={openNavbar}>
					</FontAwesomeIcon>
					<div className='navbar-title'>
						<h3 style={{ cursor: 'pointer' }}>CServer WebAdmin</h3>
						<div style={{ width: '4px', background: 'red' }} title='WebSocket connection: ' className='websocketStatus' />
					</div>
					<DarkModeToggle
						onChange={() => { setIsDarkMode(!isDarkMode); props.setTheme() }}
						isDarkMode={isDarkMode}
						className='night_btn'
						size={50}
					/>
				</div>
			)}
			{(!isMobile) && (
				<div className='navbar-head'>
					<h3 style={{ cursor: 'pointer' }}>CServer WebAdmin</h3>
					<div style={{ width: '100%', background: 'red', height: '4px' }} title='WebSocket connection: ' className='websocketStatus' />
				</div>
			)}
			<div className='buttons'>
				<Link to='/' onClick={processLink}>
					<FontAwesomeIcon icon={solid('house')}/> Home
				</Link>
				<Link to='/console' onClick={processLink}>
					<FontAwesomeIcon icon={solid('terminal')} /> Terminal
				</Link>
				<Link to='/pluginmanager' onClick={processLink}>
					<FontAwesomeIcon icon={solid('bars-progress')} /> Plugin Manager
				</Link>
				{(!isMobile) && (
					<DarkModeToggle
						onChange={() => { setIsDarkMode(!isDarkMode); props.setTheme(); }}
						isDarkMode={isDarkMode}
						className='night_btn'
						size={50}
					/>
				)}
			</div>
		</div>
	);
};

export default Navbar;
