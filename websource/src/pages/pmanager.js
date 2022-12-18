import { useState, useCallback } from 'react';
import { pluginsList, scriptsList } from '../components/CWAP/CWAP';
import Plugin from '../components/Plugin/Plugin';
import './styles/pmanager.css';

export let updatePlugins = () => { };

const PManager = ({ CWAP }) => {
    const [, updateState] = useState();
    const forceUpdate = useCallback(() => updateState({}), []);
    updatePlugins = forceUpdate;
    return (
        <div className='plugins-main'>
            <div className='plugins-grid'>
                <div className='plugins'>
                    <h3>Plugins</h3>
                    <div className='plugins-list'>
                        {pluginsList.map((pl, index) => <Plugin type='plugin' cwap={CWAP} key={index} {...pl} />)}
                    </div>
                </div>
                <div className='scripts'>
                    <h3>Lua scripts</h3>
                    <div className='plugins-list'>
                        {scriptsList.map((sc, index) => <Plugin type='script' cwap={CWAP} key={index} {...sc} />)}
                    </div>
                </div>
            </div>
        </div>
    )
};

export default PManager;
