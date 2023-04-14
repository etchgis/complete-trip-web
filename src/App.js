import { ChakraProvider, ColorModeScript, Grid } from '@chakra-ui/react';

import { BrowserRouter } from 'react-router-dom';
import ErrorToastMessage from './components/ErrorToastMessage';
import { Routes } from './Pages/Routes';
import { theme } from './theme';

// import { observer } from 'mobx-react-lite';

const App = () => {
  return (
    <>
      <ColorModeScript />
      <BrowserRouter>
        <ChakraProvider theme={theme}>
          <Grid id="shell" fontSize="xl" minH="100vh" flexDir="column">
            <Routes />
            <ErrorToastMessage></ErrorToastMessage>
          </Grid>
        </ChakraProvider>
      </BrowserRouter>
    </>
  );
};

export default App;
