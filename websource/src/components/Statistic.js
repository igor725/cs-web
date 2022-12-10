import React, { useState, useEffect } from 'react';
import './styles/Statistic.css';
import { start_uptime } from './CWAP/CWAP';

export let setCounter = (start_uptime) => { }

const Statistic = ({ cwap }) => {
    let curr_online = 0;
    const [count, setCount] = useState((Date.now() - start_uptime) / 1000);
    
    useEffect(() => {
        curr_online = document.getElementById("plist").childNodes.length
        const id = setInterval(() => setCount((oldCount) => oldCount + 1), 1000);
        return () => {
            clearInterval(id);
        };
    }, []);

    setCounter = (start_uptime) => {
        setCount((Date.now() - start_uptime) / 1000)
    }

    return (
        <div className='statistic'>
            <div className='statistic-text'>
                <table>
                    <tbody>
                        <tr>
                            <td>Software: </td>
                            <td>{cwap.getSoftwareName()}</td>
                        </tr>
                        <tr>
                            <td>Uptime: </td>
                            <td id='counter'>{new Date(count * 1000).toISOString().slice(11, 19)}</td>
                        </tr>
                    </tbody>
                </table>
                <table>
                    <tbody>
                        <tr>
                            <td>Online: </td>
                            <td>{curr_online} / 25</td>
                        </tr>
                        <tr>
                            <td>RAM: </td>
                            <td>228MB / 1596GB</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Statistic;
