import React, { useEffect } from "react";
import './Plugin.css';
import Slidebutton from "../buttons/slidebutton";

let shiftPressed = false;
let pressedEl;
let prevEl;

const states = {
	'Unload': 'Force unload',
	'Reload': 'Force reload'
}

const Plugin = props => {
	let isAnswer = false;
	const cwap = props.cwap;
	const extId = props.id;
	const extType = props.type;
	const extName = props.name;
	const extTypeNum = extType == 'script';

	const mouseOver = (e) => {
		const btnObj = e.target;
		if (btnObj.className === 'btn ') {
			if (shiftPressed) {
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
	}
	const reload = (e) => {
		if (shiftPressed) {
			console.log("FORCE RELOAD")
		} else {
			cwap.reldisExtension(extTypeNum, extId)
		}
	}
	const unload = (e) => {
		const btnObj = e.target;
		const extName = btnObj.parentElement.parentElement.getAttribute("name");
		if (extName === "web.dll") {
			if (isAnswer) {
				btnObj.innerHTML = "Ok";
				isAnswer = false;
				setTimeout(() => btnObj.innerHTML = "Unload", 1000)
				cwap.unloadExtension(extTypeNum, extId);
				return;
			}
			btnObj.innerHTML = "Are You Sure?";
			isAnswer = true;
			return;
		}
		if (shiftPressed) {
			console.log("FORCE UNLOAD")
			// do stuff
			return;
		}
		cwap.unloadExtension(extTypeNum, extId);
	}

	useEffect(() => {
		document.onkeydown = (e) => {
			if (e.shiftKey) shiftPressed = true;
		}
		document.onkeyup = (e) => {
			if (!e.shiftkey) {
				shiftPressed = false
				pressedEl && (pressedEl.innerHTML = prevEl)
			};
		}

		return () => {
			document.onkeydown = '';
			document.onkeyup = '';
		}
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
								{props.home && (<a href={props.home} target="_blank" rel='noreferrer'>Author's link</a>) || ("Not included")}</td>
						</tr>
					</tbody>
				</table>
			</div>
			<div className="plugin-buttons" onMouseOver={mouseOver}>
				<Slidebutton slidecolor='#ff2b2b' bgcolor='black' onClick={unload}>Unload</Slidebutton>
				{extType === 'plugin' && (
					<Slidebutton slidecolor='#ff2b2b' bgcolor='black' onClick={() => cwap.reldisExtension(extTypeNum, extId)}>Disable</Slidebutton>
				) || (
						<Slidebutton slidecolor='#ff2b2b' bgcolor='black' isDisabled={!props.hotReload}
							title={props.hotReload ? '' : 'This script cannot be hot reloaded'}
							onClick={reload}
						>Reload</Slidebutton>)
				}
				<Slidebutton slidecolor='#6529cd' bgcolor='black'>Settings</Slidebutton>
			</div>
		</div>
	)
}

export default Plugin;
