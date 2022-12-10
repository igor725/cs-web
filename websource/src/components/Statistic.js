import React from 'react';
import './styles/Statistic.css';


const Statistic = ({cwap}) => {
    return (
        <div className='statistic'>
            <div className='statistic-text'>
                <table>
                    <caption>
                        {cwap.getSoftwareName()}
                    </caption>
                    <tbody>
                        <tr>
                            <td>Server IP: </td>
                            <td>0.0.0.0:25565</td>
                        </tr>
                        <tr>
                            <td>uptime: </td>
                            <td>09:56:11</td>
                        </tr>
                        <tr>
                            <td>OS: </td>
                            <td>Windows 64</td>
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
                            <td>Server time: </td>
                            <td></td>
                        </tr>
                        <tr>
                            <td>RAM: </td>
                            <td>228MB / 1596GB</td>
                        </tr>
                        <tr>
                            <td>CPU: </td>
                            <td>2.28%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Statistic;
