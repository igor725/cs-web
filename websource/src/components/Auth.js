import React from 'react';
import { MD5 } from 'md5-js-tools';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { regular } from '@fortawesome/fontawesome-svg-core/import.macro';

import './styles/Auth.css';

export let showAuth = () => {};
export let hideAuth = () => {};
export let showAuthError = () => {};
export let doAuthGood = () => {};
export let doLogin = () => {};
export let hack_auth = (hash) => {};

let pass_candidate;
const Auth = ({cwap}) => {
	const authWindow = document.getElementsByClassName('authWindowG')[0];
	const authError = document.getElementById('status');
	showAuth = () => authWindow.style.display = 'block';

	showAuthError = () => {
		showAuth();
		authError.innerHTML = 'Wrong password';
	};

	hideAuth = () => {
		authWindow.style.display = 'none';
		localStorage.setItem('USER_PASSWORD', pass_candidate);
		cwap.switchState(window.location.pathname);
	};

	doAuthGood = () => {
		hideAuth();
		localStorage.setItem('USER_PASSWORD', pass_candidate);
		cwap.switchState(window.location.pathname);
	};

	doLogin = (pass, md5) => {
		let hash;
		if (!md5) {
			const password = document.getElementById('authPassword');
			hash = MD5.generate(password.value);
			password.value = '';
		} else hash = pass;
		cwap.sendAuth(hash);
		pass_candidate = hash;
	};

	return (
		<div className='authWindowG'>
			<div className='authWindow'>
				<div className='authWindowMain'>
					<h2>WebAdmin Password</h2>
					<FontAwesomeIcon id='userlogo' icon={regular("user")}/>
					<input type='password' id='authPassword' placeholder='password'/>
					<p id='status'></p>
					<button className='btn41-43 btn-41 loginBtn' onClick={doLogin}>
						Log In
					</button>
				</div>
			</div>
		</div>
	);
}

export default Auth;
