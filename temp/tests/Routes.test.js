// import { Route, Router, Routes } from 'react-router-dom';

import { render, screen } from '@testing-library/react';

import { ChakraProvider } from '@chakra-ui/react';
import { Navbar } from '../components/Navbar/Navbar';

// import { AppRoutes } from './Routes';

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
      <Navbar />
    </ChakraProvider>
  );
});
