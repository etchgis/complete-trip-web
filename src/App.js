import { ChakraProvider, ColorModeScript, Grid } from '@chakra-ui/react';

import { BrowserRouter } from 'react-router-dom';
import ErrorToastMessage from './components/ErrorToastMessage';
import { Router } from './Pages/Router';
import { theme } from './theme';

// import { observer } from 'mobx-react-lite';

const App = () => {
  return (
    <>
      <ColorModeScript />
      <BrowserRouter>
        <ChakraProvider theme={theme}>
          <Grid id="shell" fontSize="xl" minH="100vh" flexDir="column">
            <Router />
            <ErrorToastMessage></ErrorToastMessage>
          </Grid>
        </ChakraProvider>
      </BrowserRouter>
    </>
  );
};

export default App;