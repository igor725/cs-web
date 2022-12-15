import React from 'react';

import './styles/Layout.css';
import Navbar from './Navbar';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export let setTheme = () => {};

const Layout = ({ CWAP, children }) => {
	const root = document.getElementsByTagName('body')[0];
	
	const switchNavBtnColor = (isDarkMode) =>{
		root.style.setProperty('--navbar-select-color', isDarkMode ? '#664682':'#bf78fd')
	}
	// Не заносить isDarkMode в общую переменную - оно меняется каждый вызов
	const isDarkMode = window.localStorage.getItem('DARKMODE_STATE') === 'true'
	root.className = (isDarkMode ? 'darkmode' : 'lightmode');
	switchNavBtnColor(isDarkMode);

	setTheme = () => {
		const isDarkMode = window.localStorage.getItem('DARKMODE_STATE') === 'true'
		root.className = isDarkMode ? 'lightmode' : 'darkmode';
		switchNavBtnColor(!isDarkMode);
	};

	return (
		<React.Fragment>
			<div className='layout-container'>
				<Navbar CWAP = {CWAP} setTheme = {setTheme}/>
			</div>
			<ToastContainer theme={(window.localStorage.getItem('DARKMODE_STATE') === 'true') ? 'dark' : 'light'}/>
			<div id='main'>
				{children}
			</div>
		</React.Fragment>
	);
};

export default Layout;
