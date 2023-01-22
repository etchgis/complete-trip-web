import '@fontsource/open-sans';

import * as ReactDOM from 'react-dom/client';

import {
  ChakraProvider,
  ColorModeScript,
  Grid,
  extendTheme,
} from '@chakra-ui/react';
import React, { StrictMode } from 'react';

import { BrowserRouter as Router } from 'react-router-dom';
import Routes from './routes';
// import { SaasProvider } from '@saas-ui/react';
import { StepsTheme as Steps } from 'chakra-ui-steps';

// import * as serviceWorker from './serviceWorker';

// import reportWebVitals from './reportWebVitals';

//TODO move to it's own file
const customTheme = {
  components: {
    Steps,
    FormLabel: {
      baseStyle: {
        fontWeight: 'bold',
      },
    },
    Button: {
      baseStyle: {
        cursor: 'pointer',
        fontWeight: 500,
      },
    },
  },
  colors: {
    brand: '#3C8AFF',
    brandDark: '#165BC1',
    base: '#3C8AFF',
  },
  fonts: {
    heading: `'Open Sans', sans-serif`,
    body: `'Open Sans', sans-serif`,
  },
  initialColorMode: localStorage.getItem('chakra-ui-color-mode')
    ? localStorage.getItem('chakra-ui-color-mode')
    : 'light',
  useSystemColorMode: false,
};

const theme = extendTheme(customTheme);

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
console.log('[env]', process.env.NODE_ENV);

root.render(
  <StrictMode>
    <ColorModeScript />
    <Router
      basename={process.env.NODE_ENV === 'production' ? '/blitzwing/' : '/'}
    >
      <ChakraProvider theme={theme}>
        <Grid id="shell" fontSize="xl" minH="100vh" flexDir="column">
          <Routes />
        </Grid>
      </ChakraProvider>
    </Router>
  </StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
// serviceWorker.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(console.log);
