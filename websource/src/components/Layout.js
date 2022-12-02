import React, { useState } from 'react';
import "./styles/Layout.css"
import Navbar from './Navbar';

const Layout = ({ children }) => {
    const [isUpdate, setUpdate] = useState(0)
    function setTheme() {
        const navbar = document.getElementsByClassName("navbar")[0]
        setUpdate(isUpdate + 1)
        if (!(window.localStorage.getItem('DARKMODE_STATE') === 'true') || false){
            navbar.classList.add("dark")
        } else{
            navbar.classList.remove('dark')
        }
    }
    return (
        <React.Fragment>
            <div className="layout-container">
                <Navbar setTheme={setTheme} />
            </div>
            <div className={isUpdate > 0 ? !(window.localStorage.getItem('DARKMODE_STATE') === 'true') || false ? "darkmode" : "lightmode" : (window.localStorage.getItem('DARKMODE_STATE') === 'true') || false ? "darkmode" : "lightmode"} key={isUpdate}>
                {children}
            </div>
        </React.Fragment>
    );
}
export default Layout