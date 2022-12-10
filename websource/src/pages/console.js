import React, { useEffect } from 'react';
import Clipboard, { doCopy } from '../components/clipboard/clipboard';
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

let messages = [], history = [], hispos = 0;
export let writeInConsole = () => { };

const Console = ({ CWAP }) => {
	const [, updateState] = React.useState();
	const forceUpdate = React.useCallback(() => updateState({}), []);

	let text;
	let input_el;

	const scrollToLatest = () => {
		setTimeout(() => text.scrollTop = text.scrollHeight, 200);
	};

	useEffect(() => {
		text = document.getElementById('console-out');
		input_el = document.getElementById('console-in');
		scrollToLatest();
	});

	const pushMessage = (msg) => {
		messages.push(msg);
		while (messages.length > 99)
			messages.shift();
	};

	writeInConsole = (msg) => {
		if (!msg) return;
		pushMessage(<div dangerouslySetInnerHTML={{
			__html: convert.toHtml(msg).replaceAll('  ', '&emsp;')
		}}></div>);
		forceUpdate();
		scrollToLatest();
	};

	return (
		<div className='console'>
			<Clipboard />
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
				<div id='console-out' readOnly={true} onContextMenu={doCopy}>
					{messages.map((msg, i) => {
						return React.cloneElement(msg, { key: i });
					})}
				</div>
				<div className='inputting-field'>
					<p className='console-in-dot'> &gt; </p>
					<input name='input-mac' id='console-in' type='text' onKeyDown={(e) => {
						switch (e.key) {
							case 'Enter':
								if (input_el.value.length > 0) {
									pushMessage(<div> &gt; {CWAP.sendConsole(input_el.value)}</div>);
									hispos = 0;
									history.push(input_el.value);
									input_el.value = '';
									scrollToLatest();
								}
								break;
							case 'ArrowUp':
								if (history.length === 0) break;
								if (--hispos < 0) hispos = history.length - 1;
								input_el.value = history[hispos];
								break;
							case 'ArrowDown':
								if (history.length === 0) break;
								if (++hispos >= history.length) hispos = 0;
								input_el.value = history[hispos];
								break;
						}
					}} autoComplete='off' />
				</div>
			</div>
		</div>
	);
}

export default Console;
