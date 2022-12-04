import React from 'react';
import Pages from './pages';
import CWAP from './components/CWAP/CWAP';
import Auth from './components/Auth';

function App() {
  const cwap = CWAP()
  return (
    <React.Fragment>
      <Auth cwap={cwap}/>
      <Pages cwap={cwap}/>
    </React.Fragment>
  )
}

export default App;
