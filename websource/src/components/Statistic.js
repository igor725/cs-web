import React from 'react';
import HalfedProgress from './halfedProgressBar/halfProgress';
import './styles/Statistic.css';


const Statistic = ({cwap}) => {
    return(
        <div className='statistic'>
            <div className='statistic-usage'>
                <HalfedProgress value={12} max={100} name='CPU'/>
                <HalfedProgress value={50} max={100} name='RAM'/>
            </div>
            <div className='statistic-text'>
                <p> bebra </p>
            </div>
        </div>
    )
}

export default Statistic;
