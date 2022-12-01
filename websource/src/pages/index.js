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
                    <Route exact path="/configeditor" element={<CFGeditor />}/>
                    <Route exact path="/console" element={<CFGeditor />}/>
                    <Route exact path="/pluginmanager" element={<CFGeditor />}/>
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}
export default Pages