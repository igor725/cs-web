import React from "react";
import './Plugin.css';
import Slidebutton from "../buttons/slidebutton";

const Plugin = props => {
    return (
        <div className="plugin">
            <h4>{props.name}</h4>
            <div className="plugin-info">
                <table>
                    <tbody>
                        <tr>
                            <td>Version: </td>
                            <td>{props.version}</td>
                        </tr>
                        <tr>
                            <td>Homepage: </td>
                            <td><a href={props.home} target="_blank" rel='noreferrer'>{props.home}</a></td>
                        </tr>
                    </tbody>
                </table>
                {/* <div className="plugin-info-header">
                    <p>Version: </p>
                    <p>Homepage:</p>
                    {props.type == 'script' && (<p>RAM usage: </p>)}
                </div>
                <div className="plugin-info-values">
                    <p>{props.extVer}</p>
                    <a href={props.extHome} target="_blank">{props.extHome}</a>
                    {props.type == 'script' && (<p>{props.ram_usage}</p>)}
                </div> */}
            </div>
            <div className="plugin-buttons">
                <Slidebutton slidecolor='red'>Unload</Slidebutton>
                <Slidebutton slidecolor='red'>Disable</Slidebutton>
                <Slidebutton slidecolor='blue'>Settings</Slidebutton>
            </div>
        </div>
    )
}

export default Plugin;
