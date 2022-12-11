import React from "react";
import './styles/slidebutton.css'

const Slidebutton = props => {
    const bgColor = props.bgcolor;
    const slideColor = props.slidecolor
    const to = props.to === "right" ? "-100%" : "101%";
    const onclick = props.onClick;
    const children = props.children;

    return (
        <a href='#' className="btn" style={{"--bg-color": bgColor, "--slide-color": slideColor, "--translate-to": to}} onClick={onclick}>
            {children}
        </a>
    )
}
export default Slidebutton;
