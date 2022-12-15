import React from 'react';
import './fancyselect.css';


const Fancyselect = props => {
    return (
        <select className='fancyselect' {...props}>
            { props.children }
        </select>
    )
}

export default Fancyselect;
