import React, { useEffect } from 'react';
import './Plugin.css';
import Slidebutton from '../buttons/slidebutton';

let shiftPressed = false;
let pressedEl;
let prevEl;

const states = {
	'Unload': 'Force unload',
	'Reload': 'Force reload'
}

const Plugin = props => {
	let unTimer = null;
	const cwap = props.cwap;
	const extId = props.id;
	const extType = props.type;
	const extName = props.name;
	const extTypeNum = extType == 'script';

	const mouseOver = (e) => {
		const btnObj = e.target;
		if (btnObj.className === 'btn ') {
			if (shiftPressed && extType != 'plugin') {
				const prev = btnObj.innerHTML;
				if (btnObj !== pressedEl) {
					pressedEl && (pressedEl.innerHTML = prevEl);
					pressedEl = btnObj
					prevEl = prev;
				}
				if (Object.keys(states).includes(prev)) {
					pressedEl.innerHTML = states[prev];
				}
			}
		}
	};

	useEffect(() => {
		document.onkeydown = (e) => {
			if (e.shiftKey) shiftPressed = true;
		};

		document.onkeyup = (e) => {
			if (!e.shiftkey) {
				shiftPressed = false;
				pressedEl && (pressedEl.innerHTML = prevEl);
			}
		};

		if (unTimer && !extName.startsWith('web.')) {
			clearTimeout(unTimer);
			unTimer = null;
		}

		return () => {
			document.onkeydown = '';
			document.onkeyup = '';
		};
	})

	return (
		<div className='plugin' name={extName}>
			<h4>{extName}</h4>
			<div className='plugin-info'>
				<table>
					<tbody>
						<tr>
							<td>Version: </td>
							<td>{props.version}</td>
						</tr>
						<tr>
							<td>Homepage: </td>
							<td id='link'>
								{props.home && (<a href={props.home} target='_blank' rel='noreferrer'>Author's link</a>) || ('Not included')}</td>
						</tr>
					</tbody>
				</table>
			</div>
			<div className='plugin-buttons' onMouseOver={mouseOver}>
				<Slidebutton slidecolor='#ff2b2b' bgcolor='black'
					onClick={() => cwap.unloadExtension(extTypeNum, extId, shiftPressed && extType != 'plugin')}
				>Unload</Slidebutton>
				{extType === 'plugin' && (
					<Slidebutton slidecolor='#ff2b2b' bgcolor='black' onClick={() => cwap.reldisExtension(extTypeNum, extId, false)}>Disable</Slidebutton>
				) || (
						<Slidebutton slidecolor='#ff2b2b' bgcolor='black' isDisabled={!props.hotReload}
							title={props.hotReload ? '' : 'This script cannot be hot reloaded'}
							onClick={() => cwap.reldisExtension(extTypeNum, extId, shiftPressed)}
						>Reload</Slidebutton>)
				}
				<Slidebutton slidecolor='#6529cd' bgcolor='black'>Settings</Slidebutton>
			</div>
		</div>
	)
}

export default Plugin;
