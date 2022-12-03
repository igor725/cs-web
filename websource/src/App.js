import Pages from './pages';
import React from 'react';
import CWAP from './components/CWAP/CWAP';

function App() {
  const cwap = CWAP()
  return (
    <Pages cwap={cwap}/>
  )
}

export default App;
