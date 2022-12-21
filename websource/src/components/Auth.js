import { MD5 } from 'md5-js-tools';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { regular } from '@fortawesome/fontawesome-svg-core/import.macro';

import './styles/Auth.css';
import Slidebutton from './buttons/slidebutton.js';
import { useRef } from 'react';

export let showAuth = () => { };
export let showAuthError = () => { };
export let doAuthGood = () => { };
export let doLogin = () => { };

let passСandidate;
const LOG_IN_MSG = 'Log in';

const Auth = ({ cwap }) => {
	const authWindow = useRef(null);
	const authError = useRef(null);
	const password = useRef(null);
	const loginBtn = useRef(null);

	showAuth = () => authWindow.current.style.display = 'block';

	showAuthError = () => {
		showAuth();
		setTimeout(() => {
			loginBtn.current.classList.add('fancyLoginFailed');
		}, 500);
		setTimeout(() => {
			authError.current.innerHTML = 'Wrong password';
			authError.current.classList.add('badPassAnimation');
			setTimeout(() => authError.current.classList.remove('badPassAnimation'), 260);
			loginBtn.current.classList.remove('fancyLoginFailed', 'fancyLoginAnim');
		}, 1000);
	};

	doAuthGood = (localPass) => {
		if (!localPass) {
			setTimeout(() => {
				authWindow.current.classList.add('fancyLoginSuccess');
			}, 500);
			setTimeout(() => {
				authWindow.current.style.display = 'none';
			}, 1500);
		} else {
			authWindow.current.style.display = 'none';
		}
		localStorage.setItem('USER_PASSWORD', passСandidate);
		cwap.switchState(window.location.pathname);
	};
	doLogin = (hash) => {
		if (!hash) {
			loginBtn.current.classList.add('fancyLoginAnim');
			loginBtn.current.innerHTML = 'Logging in...';
			setTimeout(() => loginBtn.current.innerHTML = LOG_IN_MSG, 1000);
			console.log(loginBtn);
			let pass;
			if ((pass = password.current.value).length > 1) {
				hash = MD5.generate(pass);
			} else {
				return;
			}
			password.current.value = '';
			authError.current.innerHTML = '';
		}
		cwap.sendAuth(hash);
		passСandidate = hash;
	};

	return (
		<div className='authWindowG' ref={authWindow}>
			<div className='authWindow'>
				<div>
					<div className='auth-text'>
						<h3>cserver</h3>
					</div>
					<div className='authWindowMain'>
						<h2>WebAdmin Password</h2>
						<FontAwesomeIcon id='userlogo' icon={regular('user')} />
						<input type='password' id='authPassword' ref={password} placeholder='password' onKeyDown={(e) => {
							if (e.key === 'Enter') doLogin();
						}} />
						<p id='status' ref={authError}></p>
						<div className='loginBtn'>
							<Slidebutton slidetextcolor='black' inputRef={loginBtn} onClick={() => {
								if (password.current.value.length > 1) doLogin();
							}}>
								{LOG_IN_MSG}
							</Slidebutton>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Auth;
