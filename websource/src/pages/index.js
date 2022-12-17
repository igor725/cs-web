import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';

import PManager from './pmanager';
import Console from './console';
import Home from './home';
import NotFound from './notfound';


const Pages = ({ cwap }) => {
	return (
		<BrowserRouter>
			<Layout CWAP={cwap}>
				<Routes>
					<Route path='/' element={<Home CWAP={cwap} />} />
					<Route path='/console' element={<Console CWAP={cwap} />} />
					<Route path='/pluginmanager' element={<PManager CWAP={cwap} />} />
					<Route path='*' element={<NotFound/>} />
				</Routes>
			</Layout>
		</BrowserRouter>
	);
};

export default Pages;
