import React, { useState, useEffect } from 'react';
import './styles/Statistic.css';
import { playersList } from './CWAP/CWAP';
import { startupTime } from './CWAP/CWAP';

let maxPlayers = 0;
export let setCounters = (_maxp) => {};

const Statistic = ({ cwap }) => {
	let curp = playersList.length;
	const [count, setCount] = useState((Date.now() - startupTime) / 1000);
	const [maxp, setMaxp] = useState(maxPlayers);

	useEffect(() => {
		const id = setInterval(() => setCount((oldCount) => oldCount + 1), 1000);
		return () => clearInterval(id);
	}, []);

	setCounters = (_maxp) => {
		setCount((Date.now() - startupTime) / 1000); setMaxp(_maxp);
		maxPlayers = _maxp;
	};

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
							<td>{curp} / {maxp}</td>
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
