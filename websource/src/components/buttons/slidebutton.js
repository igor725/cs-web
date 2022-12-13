import React from "react";
import './styles/slidebutton.css'

const Slidebutton = props => {
    const children = props.children;
    const onclick = props.onClick;
    const bgcolor = props.bgcolor;
    const slidecolor = props.slidecolor;
    const slidetextcolor = props.slidetextcolor;
    const disabled = props.isDisabled || false;
    const title = props.title || '';

    return (
        // eslint-disable-next-line
        <a className={"btn " + (disabled ? "disabled" : "")} onClick={onclick} title={title} style={{ "--bgcolor": bgcolor, "--slidecolor": slidecolor, "--slidetextcolor": slidetextcolor }}>
            {children}
        </a>
    )
}
export default Slidebutton;
