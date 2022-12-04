import React from 'react'
import './styles/console.css'
var Convert = require('ansi-to-html');
var convert = new Convert({
    newline: true,
    escapeXML: true,
    colors: {
        0: '#878787',
        4: '#335fc2',
        2: '#3db17c',
        6: '#3c9dc9',
        1: '#e7243c',
        5: '#c35bc5',
        3: '#e4e645',
        7: '#e5e5e5',
    }
});

let messages = [];
export let writeInConsole = () => {};

const Console = ({ CWAP }) => {
    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);

    writeInConsole = (msg) => {
        const text = document.getElementById("console-out");
        messages.push(<div dangerouslySetInnerHTML={{
            __html: convert.toHtml(msg).replaceAll("  ", "&emsp;")
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
                    <input name='input-mac' id='console-in' type='text' onKeyDown={(e) => {
                        const text = document.getElementById("console-out");
                        if (e.key == "Enter") {
                            const input_el = document.getElementById("console-in");
                            if (input_el.value.length > 0) {
                                messages.push(<div> > {CWAP.sendConsole(input_el.value)}</div>);
                                input_el.value = "";
                                setTimeout(() => {
                                    text.scrollTop = text.scrollHeight;
                                }, 100);
                            }
                        }
                    }} autocomplete="off"/>
                </div>
            </div>
        </div>
    )
}

export default Console;
