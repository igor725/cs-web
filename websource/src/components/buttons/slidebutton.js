import React from "react";
import './styles/slidebutton.css'

const Slidebutton = props => {
    const children = props.children;
    const onclick = props.onClick;

    return (
        <a href='#' class="btn" onClick={onclick}>
            {children}
        </a>
    )
}
export default Slidebutton;
