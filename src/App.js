import { ChakraProvider, ColorModeScript, Grid } from '@chakra-ui/react';

import { BrowserRouter } from 'react-router-dom';
import { Routes } from './Pages/Routes';
import { theme } from './theme';

//NOTE app does not use mox observer - this is just the App shell
const App = () => {
  return (
    <>
      <ColorModeScript />
      <BrowserRouter>
        <ChakraProvider theme={theme}>
          <Grid id="shell" fontSize="lg" minH="100vh" flexDir="column">
            <Routes />
          </Grid>
        </ChakraProvider>
      </BrowserRouter>
    </>
  );
};

export default App;
