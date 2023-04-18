import '@fontsource/open-sans';
import './style.css';

import * as ReactDOM from 'react-dom/client';

import RootStore, { StoreProvider } from './context/RootStore';

import App from './App';
import React from 'react';

// import { SaasProvider } from '@saas-ui/react';
// import * as serviceWorker from './serviceWorker';
// import reportWebVitals from './reportWebVitals';

//TODO move to it's own file

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
console.log('[env]', process.env.NODE_ENV);
const store = new RootStore();

root.render(
  // <StrictMode>
  <StoreProvider store={store}>
    <App />
  </StoreProvider>
  // </StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
// serviceWorker.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(console.log);
