import React, { useEffect } from 'react';

import "./styles/Layout.css"
import Navbar from './Navbar';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Layout = ({ CWAP, children }) => {
    function setTheme() {
        const root = document.getElementById("main")
        if (!(window.localStorage.getItem('DARKMODE_STATE') === 'true') || false){
            root.className = "darkmode"
        } else{
            root.className = "lightmode"
        }
    }
    useEffect(()=>{
        // console.log(1)
        CWAP.switchState(window.location.pathname)
    }, [])
    return (
        <React.Fragment>
            <div className="layout-container">
                <Navbar CWAP = {CWAP} setTheme = {setTheme}/>
            </div>
            <ToastContainer theme={(window.localStorage.getItem('DARKMODE_STATE') === 'true') || false ? "dark":"light"}/>
            <div id='main' className={(window.localStorage.getItem('DARKMODE_STATE') === 'true') || false ? "darkmode" : "lightmode"}>
                {children}
            </div>
        </React.Fragment>
    );
}
export default Layout