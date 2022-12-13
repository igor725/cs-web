import React from "react";
import './styles/slidebutton.css'

const Slidebutton = props => {
    const children = props.children;
    const onclick = props.onClick;

    return (
        // eslint-disable-next-line
        <a className="btn" onClick={onclick}>
            {children}
        </a>
    )
}
export default Slidebutton;
