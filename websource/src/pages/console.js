import React from 'react'
import './styles/console.css'
var Convert = require('ansi-to-html');
var convert = new Convert();

let messages = [];
export let writeInConsole = () => {};

const Console = ({ CWAP }) => {
    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);
    const escapeHtml = (unsafe) => {
        return unsafe.replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
    };
    const sendTo = (e) => {
        const text = document.getElementById("console-out");
        if (e.key == "Enter") {
            const input_el = document.getElementById("console-in");
            if (input_el.value.length > 0) {
                messages.push(<div>{CWAP.sendConsole(input_el.value)}</div>);
                input_el.value = "";
                setTimeout(() => {
                    text.scrollTop = text.scrollHeight;
                }, 100);
            }
        }
    }

    writeInConsole = (msg) => {
        const text = document.getElementById("console-out");
        messages.push(<div dangerouslySetInnerHTML={{
            __html: convert.toHtml(escapeHtml(msg)).replace(/(?:\r\n|\r|\n)/g, '<br>')
        }}></div>);
        forceUpdate();
        setTimeout(() => {
            text.scrollTop = text.scrollHeight;
        }, 100);
    };

    return (
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
                        return React.cloneElement(msg);
                    })}
                </div>
                <div className='inputting-field'>
                    <p className='console-in-dot'> &gt; </p>
                    <input name='input-mac' id='console-in' type='text' onKeyDown={sendTo} autocomplete="off"/>
                </div>
            </div>
        </div>
    )
}

export default Console;
