// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom

// import '@testing-library/jest-dom';

import '@testing-library/cypress/add-commands';

import RootStore, { StoreProvider } from './context/RootStore';

import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import { theme } from './theme';

const store = new RootStore();

export const TestWrapper = ({ children, route }) => (
  <MemoryRouter initialEntries={[route || '/']}>
    <StoreProvider store={store}>
      <ChakraProvider theme={theme}>{children}</ChakraProvider>
    </StoreProvider>
  </MemoryRouter>
);
