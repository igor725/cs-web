import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Layout from '../components/Layout'
import CFGeditor from './cfgeditor'

import Home from './home'

const Pages = () => {
    return(
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route exact path="/" element={<Home />}/>
                    <Route exact path="/cfgeditor" element={<CFGeditor />}/>
                    {/* <Route path="/play" element={<Play />}/>
                    <Route path="/experimental" element={<Experimental />}/>
                    <Route path="/files" element={<Files />}/> */}
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}
export default Pages