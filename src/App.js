import { ChakraProvider, ColorModeScript, Grid } from '@chakra-ui/react';

import { BrowserRouter } from 'react-router-dom';
import ErrorToastMessage from './components/ErrorToastMessage';
import { AppRoutes as Routes } from './routes/Routes';
import { observer } from 'mobx-react-lite';
import { theme } from './theme';

const App = observer(() => {
  //NOTE passing user this way avoids a re-render loop on the routes page as {user} is set in the store on each render, which useEffect thinks is a new object
  //this also allows the nested routes to render on a page refresh since the user is passed down
  //but this does not refresh the user state on the routes page : (
  // const { user } = useStore().authentication;

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
});

export default App;
