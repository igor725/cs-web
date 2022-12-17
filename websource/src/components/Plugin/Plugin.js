import { useEffect } from 'react';
import { webId } from '../CWAP/CWAP';
import Slidebutton from '../buttons/slidebutton';
import './Plugin.css';

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
	const extTypeNum = extType === 'script';

	const unloadbtn = (<Slidebutton slidecolor='#ff2b2b' bgcolor='#323232'
		onClick={() => cwap.unloadExtension(extTypeNum, extId, shiftPressed && extType !== 'plugin')}
	>Unload</Slidebutton>);

	const disableBtn = (<Slidebutton slidecolor='#ff2b2b' bgcolor='#323232' 
		onClick={() => cwap.reldisExtension(extTypeNum, extId, false)}
	>Disable</Slidebutton>);

	const reloadBtn = (<Slidebutton slidecolor='#ff2b2b' bgcolor='#323232' isDisabled={!props.hotReload}
		title={props.hotReload ? '' : 'This script cannot be hot reloaded'}
		onClick={() => cwap.reldisExtension(extTypeNum, extId, shiftPressed)}
	>Reload</Slidebutton>);

	const mouseOver = (e) => {
		const btnObj = e.target;
		if (btnObj.className === 'btn ' && btnObj.innerHTML !== 'Reload') {
			if (shiftPressed && extType !== 'plugin') {
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
								{props.home && (
									<Slidebutton bgcolor='transparent' slidecolor='#786de12f' href={props.home}>Author's link</Slidebutton>
								) || ('Not included')}</td>
						</tr>
					</tbody>
				</table>
			</div>
			<div className='plugin-buttons' onMouseOver={mouseOver}>
				{(extType === 'plugin' && extId !== webId || extType === 'script') && unloadbtn}
				{extType === 'plugin' && extId !== webId && disableBtn}
				{extType === 'script' && reloadBtn}
				<Slidebutton slidecolor='#6529cd' bgcolor='#323232'>Settings</Slidebutton>
			</div>
		</div>
	)
}

export default Plugin;
