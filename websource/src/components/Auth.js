import React from 'react';
import { MD5 } from "md5-js-tools";
import "./styles/Auth.css"

export let showAuth = () =>{}
export let showAuthError = () => {}
export let doAuthGood = () => {}
export let hack_auth = (hash) => {}

let pass_candidate;
const Auth = ({cwap}) =>{
    const authWindow = document.getElementsByClassName("authWindowG")[0]
    const authError = document.getElementById("status")
    showAuth = () => {
        authWindow.style.display = "block"
    }
    showAuthError = () => {
        authError.innerHTML = "Wrong password"
    }
    doAuthGood = () => {
        authWindow.style.display = "none";
        console.log(pass_candidate)
        localStorage.setItem('USER_PASSWORD', pass_candidate)
    }
    hack_auth = (hash) => {
        cwap.sendAuth(hash)
        cwap.switchState(window.location.pathname)
    }
    function doLogin(){
        const password = document.getElementById("authPassword")
        const hash = MD5.generate(password.value)
        cwap.sendAuth(hash)
        cwap.switchState(window.location.pathname)
        pass_candidate = hash
        password.value = ''
    }
    return(
        <div className='authWindowG'>
            <div className='authWindow'>
                <div className='authWindowMain'>
                    <h2>WebAdmin Password</h2>
                    <i id='userlogo' className="fa duotone fa-user"></i>
                    <input type='password' id='authPassword' placeholder='password'/>
                    <p id='status'></p>
                    <a className="btn41-43 btn-41 loginBtn" onClick={doLogin}>
                        Log In
                    </a>
                </div>
            </div>
        </div>
    )
}
export default Auth