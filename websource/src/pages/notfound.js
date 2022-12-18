import Slidebutton from '../components/buttons/slidebutton';
import './styles/notfound.css';

const NotFound = () => {
    return (
        <div className="notfound">
            <div className='notfound-header'>
                <h1>404</h1>
                <p>Page, that you were looking for, seems like does not exist.</p>
            </div>
            <div className='notfound-buttons'>
                <Slidebutton href='/' bgcolor='#8263ff' slidecolor='#6c48ff'>Return to home</Slidebutton>
                <Slidebutton onClick={() => window.location.reload()} bgcolor='#404040' slidecolor='#323232'>Try again</Slidebutton>
            </div>
        </div>
    )
}

export default NotFound;
