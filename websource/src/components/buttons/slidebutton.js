import React from "react";
import './styles/slidebutton.css'

const Slidebutton = props => {
    const children = props.children;
    const onclick = props.onClick;
    const bgcolor = props.bgcolor;
    const slidecolor = props.slidecolor;
    const slidetextcolor = props.slidetextcolor;

    return (
        // eslint-disable-next-line
        <a className="btn" onClick={onclick} style={{"--bgcolor": bgcolor, "--slidecolor": slidecolor, "--slidetextcolor": slidetextcolor}}>
            {children}
        </a>
    )
}
export default Slidebutton;
