import React from 'react'
import './styles/console.css'
var Convert = require('ansi-to-html');
var convert = new Convert();

let messages = []
export let writeInConsole = () => {}

const Console = ({ CWAP }) => {
    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);
    writeInConsole = (msg) => {
        const text = document.getElementById("console-out")
        messages.push(<p>{convert.toHtml(msg)}</p>)
        forceUpdate()
        setTimeout(()=>{
            text.scrollTop = text.scrollHeight;
        },100)
    }
    function sendTo(e){
        const text = document.getElementById("console-out")
        if (e.key == "Enter"){
            const input_el = document.getElementById("console-in")
            if (input_el.value.length > 0){
                const value = input_el.value
                messages.push(<p>{value}</p>)
                input_el.value = ""
                CWAP.sendConsole(value);
                setTimeout(()=>{
                    text.scrollTop = text.scrollHeight;
                },100)
            }
        }
    }
    return(
        <div className='console'>
            <div className='console-top'>
                <div className='console-exit'>
                    <span className="dot red"></span>
                    <span className="dot yellow"></span>
                    <span className="dot green"></span>
                </div>
                <div>
                    <p className='terminal-text'> Terminal </p>
                </div>
            </div>
            <div className='console-main'>
                <div id='console-out' readOnly={true}>
                    {messages.map((msg)=>{
                        return React.cloneElement(msg)
                    })}
                </div>
                <div className='inputting-field'>
                    <p className='console-in-dot'> > </p>
                    <input name='input-mac' id='console-in' type='text' onKeyDown={sendTo} autocomplete="off"/>
                </div>
            </div>
        </div>
    )
}

export default Console;