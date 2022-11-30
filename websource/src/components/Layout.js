import React from 'react'
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return(
        <React.Fragment>
            <div className = "layout-container">
                <Navbar />
            </div>
            { children }
        </React.Fragment>
    );
}
export default Layout