import './styles/slidebutton.css';

const Slidebutton = props => {
    const disabled = props.isDisabled || false;
    const title = props.title || '';
    const href = props.href || undefined;

    return (
        // eslint-disable-next-line
        <a 
            href={href}
            ref={props.inputRef}
            className={'btn ' + (disabled ? 'disabled' : '')}
            onClick={props.onClick}
            title={title}
            style={{ '--bgcolor': props.bgcolor, '--slidecolor': props.slidecolor, '--slidetextcolor': props.slidetextcolor }}
        >
            {props.children}
        </a>
    );
};

export default Slidebutton;
