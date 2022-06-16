/* @refresh reload */
import { render } from 'solid-js/web';
import { Router, Routes, Route } from "solid-app-router"
import './index.css';
import App2 from './App2';

import CreateObjectSignalTest from './createSignalObject/Development'

render(() => 
<Router>
  <Routes>
    <Route path="/App2" element={<App2/>} />
    <Route path="/CreateObjectSignalTest" element={<CreateObjectSignalTest/>} />
    <Route path="/*" element={<h1>404</h1>}/>
  </Routes>
</Router>, document.getElementById('root') as HTMLElement);
