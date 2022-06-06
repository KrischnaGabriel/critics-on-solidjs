import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route} from "react-router-dom";
import './index.css';

import Refs from './test/ElementReferences.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/references" element={<Refs />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);

