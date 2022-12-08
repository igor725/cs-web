import React from 'react';
import { MD5 } from 'md5-js-tools';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { regular } from '@fortawesome/fontawesome-svg-core/import.macro';

import './styles/Auth.css';

export let showAuth = () => { };
export let showAuthError = () => { };
export let doAuthGood = () => { };
export let doLogin = () => { };

let pass_candidate;
const LOG_IN_MSG = "Log in";
const Auth = ({ cwap }) => {
	const authWindow = document.getElementsByClassName('authWindowG')[0];
	const authError = document.getElementById('status');
	const password = document.getElementById('authPassword');
	const loginBtn = document.getElementsByClassName("loginBtn")[0];
	showAuth = () => authWindow.style.display = 'block';

	showAuthError = () => {
		showAuth();
		setTimeout(() => {
			loginBtn.classList.add("fancyLoginFailed")
		}, 1000);
		setTimeout(() => {
			authError.innerHTML = 'Wrong password';
			authError.classList.add("badPassAnimation")
			setTimeout(() => authError.classList.remove("badPassAnimation"), 260)
			loginBtn.classList.remove("fancyLoginFailed", "fancyLoginAnim")
		}, 2000)
	};

	doAuthGood = (localPass) => {
		if (!localPass) {
			setTimeout(() => {
				authWindow.classList.add("fancyLoginSuccess");
			}, 1000)
			setTimeout(() => {
				authWindow.style.display = 'none';
			}, 2500)
		} else {
			authWindow.style.display = 'none';
		}
		!localPass && localStorage.setItem('USER_PASSWORD', pass_candidate);
		cwap.switchState(window.location.pathname);
	};
	doLogin = (hash) => {
		if (!hash) {
			loginBtn.classList.add("fancyLoginAnim");
			loginBtn.innerHTML = "Logging in..."
			setTimeout(() => loginBtn.innerHTML = LOG_IN_MSG, 2000)
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
				<div className='authWindowMain'>
					<h2>WebAdmin Password</h2>
					<FontAwesomeIcon id='userlogo' icon={regular("user")} />
					<input type='password' id='authPassword' placeholder='password' onKeyDown={(e) => {
						if (e.key == "Enter") {
							doLogin()
						}
					}} />
					<p id='status'></p>
					<button className='btn41-43 btn-41 loginBtn' onClick={() => {
						if (password.value.length > 1) {
							doLogin();
						}
					}}> {LOG_IN_MSG} </button>
				</div>
			</div>
		</div>
	);
}

export default Auth;
