import { useEffect, useRef, useState, useCallback, cloneElement } from 'react';
import Clipboard, { doCopy } from '../components/clipboard/clipboard';
import './styles/console.css';

let Convert = require('ansi-to-html');
let convert = new Convert({
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
	const [, updateState] = useState();
	const forceUpdate = useCallback(() => updateState({}), []);

	const console_out = useRef(null);
	const console_in = useRef(null);

	const scrollToLatest = () => {
		setTimeout(() => console_out.current.scrollTop = console_out.current.scrollHeight, 200);
	};

	useEffect(() => {
		scrollToLatest();
		const preventUp = e => {if (e.key === "ArrowUp") e.preventDefault();}
		document.addEventListener("keydown", preventUp);
		return () => document.removeEventListener("keydown", preventUp);
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
				<div id='console-out' ref={console_out} readOnly={true} onContextMenu={doCopy}>
					{messages.map((msg, i) => {
						return cloneElement(msg, { key: i });
					})}
				</div>
				<div className='inputting-field'>
					<p className='console-in-dot'> &gt; </p>
					<input name='input-mac' id='console-in' ref={console_in} type='text' onKeyDown={(e) => {
						switch (e.key) {
							case 'Enter':
								if (console_in.current.value.length > 0) {
									pushMessage(<div> &gt; {CWAP.sendConsole(console_in.current.value)}</div>);
									history.push(console_in.current.value);
									console_in.current.value = '';
									scrollToLatest();
									hispos = 0;
								}
								break;
							case 'ArrowUp':
								if (history.length === 0) break;
								if (--hispos < 0) hispos = history.length - 1;
								console_in.current.value = history[hispos];
								break;
							case 'ArrowDown':
								if (history.length === 0) break;
								if (++hispos >= history.length) hispos = 0;
								console_in.current.value = history[hispos];
								break;
							default: break;
						}
					}} autoComplete='off' />
				</div>
			</div>
		</div>
	);
};

export default Console;
