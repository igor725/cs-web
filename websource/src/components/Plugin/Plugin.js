import React from "react";
import './Plugin.css';
import Slidebutton from "../buttons/slidebutton";

const Plugin = props => {
    const type = props.type;
    return (
        <div className='plugin' name={props.name}>
            <h4>{props.name}</h4>
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
                <Slidebutton slidecolor='#ff2b2b' bgcolor='black' title={'Unload this ' + type}>Unload</Slidebutton>
                {type === 'plugin' && (
                    <Slidebutton slidecolor='#ff2b2b' bgcolor='black' title='Disable this plugin'>Disable</Slidebutton>
                ) || (
                    <Slidebutton slidecolor='#ff2b2b' bgcolor='black' isDisabled={!props.hotReload}
                        title={props.hotReload ? 'Reload this script' : 'This script cannot be hot reloaded'}
                    >Reload</Slidebutton>)
                }
                <Slidebutton slidecolor='#6529cd' bgcolor='black' title={'Open ' + type + ' settings'}>Settings</Slidebutton>
            </div>
        </div>
    )
}

export default Plugin;
