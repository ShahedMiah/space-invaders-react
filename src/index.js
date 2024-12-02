import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import SpaceInvaders from './components/SpaceInvaders';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SpaceInvaders />
  </React.StrictMode>
);