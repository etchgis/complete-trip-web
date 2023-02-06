import { Route, Router, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import { App } from '../../src/components/App';
import { AppRoutes } from '../../src/routes/Routes';
import { ChakraProvider } from '@chakra-ui/react';

// import { Settings } from '../components/Settings/Settings';
// import { Trips } from '../components/Trips/Trips';

test('renders the landing page', () => {
  // const mockedUsedNavigate = jest.fn();
  // jest.mock('react-router-dom', () => ({
  //   ...jest.requireActual('react-router-dom'),
  //   useNavigate: () => mockedUsedNavigate,
  // }));
  render(
    <ChakraProvider>
      <Router>
        <AppRoutes />
      </Router>
    </ChakraProvider>
  );
});
