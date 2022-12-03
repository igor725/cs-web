import React from 'react';
import Pages from './pages';
import CWAP from './components/CWAP/CWAP';

function App() {
  const cwap = CWAP()
  return (
    <Pages cwap={cwap}/>
  )
}

export default App;
