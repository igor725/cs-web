import React from "react";
import './Plugin.css';
import Slidebutton from "../buttons/slidebutton";

const Plugin = props => {
	const cwap = props.cwap;
	const extId = props.id;
	const extType = props.type;
	const extName = props.name;
	const extTypeNum = extType == 'script';

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
			<div className="plugin-buttons">
				<Slidebutton slidecolor='#ff2b2b' bgcolor='black' onClick={() => cwap.unloadExtension(extTypeNum, extId)}>Unload</Slidebutton>
				{extType === 'plugin' && (
					<Slidebutton slidecolor='#ff2b2b' bgcolor='black' onClick={() => cwap.reldisExtension(extTypeNum, extId)}>Disable</Slidebutton>
				) || (
					<Slidebutton slidecolor='#ff2b2b' bgcolor='black' isDisabled={!props.hotReload}
						title={props.hotReload ? '' : 'This script cannot be hot reloaded'}
						onClick={() => cwap.reldisExtension(extTypeNum, extId)}
					>Reload</Slidebutton>)
				}
				<Slidebutton slidecolor='#6529cd' bgcolor='black'>Settings</Slidebutton>
			</div>
		</div>
	)
}

export default Plugin;
