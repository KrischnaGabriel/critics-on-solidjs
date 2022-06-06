/* @refresh reload */
import { MountableElement, render } from 'solid-js/web';
import { Routes, Route, Router } from "solid-app-router"
import './index.css';

import Test from './Test';
import GraphTest from './pages/GraphTest'

import Refs from './test/ElementReferences.jsx';
import Signals from './test/SignalUpdates.jsx';

render(() => <Router>
    <Routes>
        <Route path="/references" element={<Refs />} />
        <Route path="/signal" element={<Signals />} />

        <Route path="/Test" element={<Test/>} />
        <Route path="/GraphTest" element={<GraphTest/>} />
    </Routes> 
</Router>, document.getElementById('root') as MountableElement);