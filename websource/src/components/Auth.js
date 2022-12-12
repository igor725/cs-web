import React from 'react';
import { MD5 } from 'md5-js-tools';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { regular } from '@fortawesome/fontawesome-svg-core/import.macro';

import './styles/Auth.css';
import Slidebutton from './buttons/slidebutton.js';

export let showAuth = () => { };
export let showAuthError = () => { };
export let doAuthGood = () => { };
export let doLogin = () => { };

let pass_candidate;
const LOG_IN_MSG = 'Log in';
const Auth = ({ cwap }) => {
	const authWindow = document.getElementsByClassName('authWindowG')[0];
	const authError = document.getElementById('status');
	const password = document.getElementById('authPassword');
	const loginBtn = document.getElementsByClassName('btn')[0];

	showAuth = () => authWindow.style.display = 'block';

	showAuthError = () => {
		showAuth();
		setTimeout(() => {
			loginBtn.classList.add('fancyLoginFailed');
		}, 500);
		setTimeout(() => {
			authError.innerHTML = 'Wrong password';
			authError.classList.add('badPassAnimation');
			setTimeout(() => authError.classList.remove('badPassAnimation'), 260);
			loginBtn.classList.remove('fancyLoginFailed', 'fancyLoginAnim');
		}, 1000);
	};

	doAuthGood = (localPass) => {
		if (!localPass) {
			setTimeout(() => {
				authWindow.classList.add('fancyLoginSuccess');
			}, 500);
			setTimeout(() => {
				authWindow.style.display = 'none';
			}, 1500);
		} else {
			authWindow.style.display = 'none';
		}
		localStorage.setItem('USER_PASSWORD', pass_candidate);
		cwap.switchState(window.location.pathname);
	};
	doLogin = (hash) => {
		if (!hash) {
			loginBtn.classList.add('fancyLoginAnim');
			loginBtn.innerHTML = 'Logging in...';
			setTimeout(() => loginBtn.innerHTML = LOG_IN_MSG, 1000);
			let pass = password.value;
			if ((pass = password.value).length > 1) {
				hash = MD5.generate(pass);
			} else {
				return;
			}
			password.value = '';
			authError.innerHTML = '';
		}
		cwap.sendAuth(hash);
		pass_candidate = hash;
	};

	return (
		<div className='authWindowG'>
			<div className='authWindow'>
				<div>
					<div className='auth-text'>
						<h3>cserver</h3>
						{/* <p>
							Another Minecraft Classic server in C. The server is still under development (see Projects tab)!

							The goal of this project is to create a stable, customizable and future-rich multiplatform Minecraft Classic server with a minimum dependencies.
						</p> */}
					</div>
					<div className='authWindowMain'>
						<h2>WebAdmin Password</h2>
						<FontAwesomeIcon id='userlogo' icon={regular('user')} />
						<input type='password' id='authPassword' placeholder='password' onKeyDown={(e) => {
							if (e.key === 'Enter') doLogin();
						}} />
						<p id='status'></p>
						<div className='loginBtn'>
							<Slidebutton bgcolor='white' slidecolor='black' to='right' onClick={() => {
								if (password.value.length > 1) doLogin();
							}}>
								{LOG_IN_MSG}
							</Slidebutton>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Auth;
