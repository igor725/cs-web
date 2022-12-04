import React from 'react';
import './styles/console.css';

var Convert = require('ansi-to-html');
var convert = new Convert({
	newline: true,
	escapeXML: true,
	colors: {
		0: '#878787',
		1: '#e7243c',
		2: '#3db17c',
		3: '#e4e645',
		4: '#335fc2',
		5: '#c35bc5',
		6: '#3c9dc9',
		7: '#e5e5e5',
	}
});

let messages = [];
export let writeInConsole = () => {};

const Console = ({ CWAP }) => {
	const [, updateState] = React.useState();
	const forceUpdate = React.useCallback(() => updateState({}), []);
	const pushMessage = (msg) => {
		messages.push(msg);
		while (messages.length > 99)
			messages.shift();
	};

	writeInConsole = (msg) => {
		const text = document.getElementById('console-out');
		pushMessage(<div dangerouslySetInnerHTML={{
			__html: convert.toHtml(msg).replaceAll('  ', '&emsp;')
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
					<span className='dot red'></span>
					<span className='dot yellow'></span>
					<span className='dot green'></span>
				</div>
				<div>
					<p className='terminal-text'> Terminal </p>
				</div>
			</div>
			<div className='console-main'>
				<div id='console-out' readOnly={true}>
					{messages.map((msg) => {
						return React.cloneElement(msg);
					})}
				</div>
				<div className='inputting-field'>
					<p className='console-in-dot'> &gt; </p>
					<input name='input-mac' id='console-in' type='text' onKeyDown={(e) => {
						const text = document.getElementById('console-out');
						if (e.key === 'Enter') {
							const input_el = document.getElementById('console-in');
							if (input_el.value.length > 0) {
								pushMessage(<div> &gt; {CWAP.sendConsole(input_el.value)}</div>);
								input_el.value = '';
								setTimeout(() => text.scrollTop = text.scrollHeight, 100);
							}
						}
					}} autoComplete='off'/>
				</div>
			</div>
		</div>
	);
}

export default Console;
