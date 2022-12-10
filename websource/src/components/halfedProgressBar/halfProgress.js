import React from 'react';
import './styles/halfProgress.css';

const HalfedProgress = props => {
    const currValue = props.value;
    const valueMax = props.max;
    const name = props.name;
    return (
        <div className='namedProgress'>
            <div className='halfprogress' 
                aria-valuenow={currValue} 
                aria-valuemin='0' 
                aria-valuemax={valueMax} style={{'--value': currValue}}>
            </div>
            <h3>{name}</h3>
        </div>
    );
}

export default HalfedProgress;
