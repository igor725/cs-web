import React from 'react';

import './styles/Layout.css';
import Navbar from './Navbar';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export let setTheme = () => {};

const Layout = ({ CWAP, children }) => {
	const root = document.getElementsByTagName('body')[0];
	root.className = ((window.localStorage.getItem('DARKMODE_STATE') === 'true') ? 'darkmode' : 'lightmode')
	setTheme = () => {
		root.className = window.localStorage.getItem('DARKMODE_STATE') === 'true' ? 'lightmode' : 'darkmode';
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
