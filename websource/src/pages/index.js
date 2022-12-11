import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';

import CFGeditor from './cfgeditor';
import PManager from './pmanager';
import Console from './console';
import Home from './home';

const Pages = ({ cwap }) => {
	return (
		<BrowserRouter>
			<Layout CWAP={cwap}>
				<Routes>
					<Route exact path='/' element={<Home CWAP={cwap} />} />
					<Route exact path='/configeditor' element={<CFGeditor CWAP={cwap} />} />
					<Route exact path='/console' element={<Console CWAP={cwap} />} />
					<Route exact path='/pluginmanager' element={<PManager CWAP={cwap} />} />
				</Routes>
			</Layout>
		</BrowserRouter>
	);
};

export default Pages;
