import React from 'react';
import { MD5 } from "md5-js-tools";
import "./styles/Auth.css"

export let showAuth = () =>{}
export let hideAuth = () => {}
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
        showAuth()
        authError.innerHTML = "Wrong password"
    }
    hideAuth = () => {
        authWindow.style.display = "none";
        localStorage.setItem('USER_PASSWORD', pass_candidate)
        cwap.switchState(window.location.pathname)
    }
    doAuthGood = () => {
        hideAuth()
        localStorage.setItem('USER_PASSWORD', pass_candidate)
        cwap.switchState(window.location.pathname)
    }
    hack_auth = (hash) => {
        doLogin(hash)
    }
    function doLogin(pass){
        let hash
        if (typeof(pass) !== "string"){
            const password = document.getElementById("authPassword")
            hash = MD5.generate(password.value)
            password.value = ''
        } else{
            hash = pass
        }
        console.log(hash)
        cwap.sendAuth(hash)
        pass_candidate = hash
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