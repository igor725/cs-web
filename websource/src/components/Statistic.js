import React from 'react';
import './styles/Statistic.css';

const Statistic = ({cwap}) => {
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
                            <td>09:56:11</td>
                        </tr>
                    </tbody>
                </table>
                <table>
                    <tbody>
                        <tr>
                            <td>Online: </td>
                            <td>0 / 25</td>
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
