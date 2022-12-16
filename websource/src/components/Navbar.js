import React, { useState, useEffect } from 'react';
import './styles/Navbar.css';
import { Link, useLocation } from 'react-router-dom';
import { DarkModeToggle } from 'react-dark-mode-toggle-2';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid, regular } from '@fortawesome/fontawesome-svg-core/import.macro';

import author1 from '../static/igor.png';
import author2 from '../static/neigor.gif';

let prevСolored;
let isOpened = false;
let isAuthors = false;
let transition;

const Navbar = props => {
	const DARKMODE_STATE = (window.localStorage.getItem('DARKMODE_STATE') === 'true') || false;
	const [isDarkMode, setIsDarkMode] = useState(DARKMODE_STATE);

	window.localStorage.setItem('DARKMODE_STATE', isDarkMode);
	const currentLocation = useLocation().pathname;

	const isMobile = (window.screen.width <= 600);
	const navbarBtns = document.getElementsByClassName('buttons')[0];
	const openBtn = document.getElementById('navbar-mobile-btn');
	const root = document.querySelector(':root');
	const authors = document.getElementsByClassName('authors')[0];

	const closeAuthors = (e) => {
		const targ = e.target;
		if (
			isAuthors && 
			targ.innerHTML !== 'CServer WebAdmin' &&
			targ.parentElement.parentElement.className !== 'author-head'
		){
			authors.classList.remove('show-authors');
			authors.classList.add('hide-authors');
			setTimeout(() => authors.classList.remove('hide-authors'), 750);
			isAuthors = false;
		}
	}

	const showAuthors = () => {
		if (isAuthors) {
			authors.classList.remove('show-authors');
			authors.classList.add('hide-authors');
			setTimeout(() => authors.classList.remove('hide-authors'), 750);
			isAuthors = false;
		} else {
			authors.classList.add('show-authors');
			isAuthors = true;
		}
	}

	const openNavbar = () => {
		openBtn.classList.toggle('navbar-open');
		setTimeout(() => openBtn.classList.toggle('navbar-btn-pressed'), 500);
		if (isOpened) {
			navbarBtns.classList.add('hide-navbar');
			setTimeout(() => navbarBtns.classList.remove('hide-navbar', 'show-navbar'), 300);
			isOpened = false;
		} else {
			navbarBtns.classList.add('show-navbar');
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
			setTimeout(() => {
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
		if (prevСolored) prevСolored.className = '';
		var els = document.querySelectorAll(`a[href='${currentLocation}']`)[0];
		if (els !== undefined) {
			if (isDarkMode) {
				els.classList.add('selected-dark', 'anim-forwards');
			} else {
				els.classList.add('selected', 'anim-forwards');
			}
			prevСolored = els;
		}
		document.addEventListener('mousedown', closeAuthors);
		return () => {
            document.removeEventListener("mousedown", closeAuthors)
        };
	});

	return (
		<div className={((window.localStorage.getItem('DARKMODE_STATE') === 'true') || false) ? 'navbar' : 'navbar light'}>
			{(isMobile) && (
				<div className='navbar-head'>
					<FontAwesomeIcon id='navbar-mobile-btn' icon={regular('square-caret-down')} onClick={openNavbar}>
					</FontAwesomeIcon>
					<div className='navbar-title'>
						<h3 style={{ cursor: 'pointer' }} onClick={showAuthors}>CServer WebAdmin</h3>
						<div style={{ width: '4px', background: 'red' }} title='WebSocket connection: ' className='websocketStatus' />
						<div className='authors'>
							<div className='author'>
								<div className='author-head'>
									<img src={author1} alt='igor725 github pfp' />
									<div>
										<a target="_blank" rel="noopener noreferrer" href='https://github.com/igor725'>@igor725 github</a>
										<p>BACKEND</p>
									</div>
								</div>
								<p>CWAP protocol dev & genius</p>
							</div>
							<div className='author'>
								<div className='author-head'>
									<img src={author2} alt='wildrun0 github pfp' />
									<div>
										<a target="_blank" rel="noopener noreferrer" href='https://github.com/wildrun0'>@wildrun0 github</a>
										<p>FRONTEND</p>
									</div>
								</div>
								<p>UI / UX design </p>
							</div>
						</div>
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
					<h3 style={{ cursor: 'pointer' }} onClick={showAuthors}>CServer WebAdmin</h3>
					<div style={{ width: '100%', background: 'red', height: '4px' }} title='WebSocket connection: ' className='websocketStatus' />
					<div className='authors' style={{cursor: "default"}}>
						<div className='author'>
							<div className='author-head'>
								<img src={author1} alt='igor725 github pfp' />
									<div>
										<a target="_blank" rel="noopener noreferrer" href='https://github.com/igor725'>@igor725 github</a>
										<p>BACKEND</p>
									</div>
								</div>
								<p>CWAP protocol dev & genius</p>
							</div>
						<div className='author'>
							<div className='author-head'>
								<img src={author2} alt='wildrun0 github pfp' />
								<div>
									<a target="_blank" rel="noopener noreferrer" href='https://github.com/wildrun0'>@wildrun0 github</a>
									<p>FRONTEND</p>
								</div>
							</div>
							<p>UI / UX design </p>
						</div>
					</div>
				</div>
			)}
			<div className='buttons' onClick={processLink}>
				<Link to='/'>
					<FontAwesomeIcon icon={solid('house')} /> Home
				</Link>
				<Link to='/console'>
					<FontAwesomeIcon icon={solid('terminal')} /> Terminal
				</Link>
				<Link to='/pluginmanager'>
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
