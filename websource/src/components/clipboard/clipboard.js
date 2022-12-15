import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import { toast } from 'react-toastify';
import './clipboard.css'


let copyMenu, prevCopy, selectedCopy;
export let doCopy = (e) => { };

const Clipboard = () => {
    const showElement = (show) => {
        if (show) {
            copyMenu.style.visibility = 'visible';
            copyMenu.style.opacity = '1'
        } else {
            copyMenu.style.visibility = 'hidden';
            copyMenu.style.opacity = '0';
        }
    }
    useEffect(() => {
        copyMenu = document.getElementsByClassName('copyboard')[0];
        window.onclick = (event) => {
            if (!event.target.matches('.copyboard')) {
                showElement(false);
                if (prevCopy) prevCopy.classList.remove('selected-text');
            }
        };
        return () => {
            window.onclick = '';
        };
    });
    doCopy = (e) => {
        e.preventDefault();
        if (prevCopy) prevCopy.classList.remove('selected-text');
        e.target.classList.add('selected-text');
        selectedCopy = e.target.innerText;
        showElement(true);
        copyMenu.style.left = e.pageX + 10 + 'px';
        copyMenu.style.top = e.pageY + 5 + 'px';
        prevCopy = e.target;
    };

    const hideCopy = () => {
        showElement(false);
        navigator.clipboard.writeText(selectedCopy);
        prevCopy.classList.add('selected-text');
        toast.success('Copied to clipboard!');
    }
    return (
        <div className='copyboard' onClick={hideCopy}>
            <FontAwesomeIcon icon={regular('clipboard')} />
        </div>
    )
}

export default Clipboard;
