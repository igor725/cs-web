import { useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { regular } from '@fortawesome/fontawesome-svg-core/import.macro';
import { toast } from 'react-toastify';
import './clipboard.css';


let prevCopy, selectedCopy;
export let doCopy = (e) => { };

const Clipboard = () => {
    const copyMenu = useRef(null);
    const showElement = (show) => {
        if (show) {
            copyMenu.current.style.visibility = 'visible';
            copyMenu.current.style.opacity = '1'
        } else {
            copyMenu.current.style.visibility = 'hidden';
            copyMenu.current.style.opacity = '0';
        }
    };

    const hideOnClick = (event) => {
        if (!event.target.matches('.copyboard')) {
            showElement(false);
            if (prevCopy) prevCopy.classList.remove('selected-text');
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', hideOnClick)
        return () => {
            document.removeEventListener('mousedown', hideOnClick)
        };
    });
    doCopy = (e) => {
        e.preventDefault();
        if (prevCopy) prevCopy.classList.remove('selected-text');
        e.target.classList.add('selected-text');
        selectedCopy = e.target.innerText;
        showElement(true);
        copyMenu.current.style.left = e.pageX + 10 + 'px';
        copyMenu.current.style.top = e.pageY + 5 + 'px';
        prevCopy = e.target;
    };

    const hideCopy = () => {
        showElement(false);
        navigator.clipboard.writeText(selectedCopy);
        prevCopy.classList.add('selected-text');
        toast.success('Copied to clipboard!');
    }
    return (
        <div className='copyboard' ref={copyMenu} onClick={hideCopy}>
            <FontAwesomeIcon icon={regular('clipboard')} />
        </div>
    )
};

export default Clipboard;
