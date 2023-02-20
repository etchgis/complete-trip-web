// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

import RootStore, { StoreProvider } from './context/mobx/RootStore';

// import React from "react";
import { ChakraProvider } from "@chakra-ui/react";

const store = new RootStore();

export const TestWrapper = ({ children }) => (
  <StoreProvider store={store}>
    <ChakraProvider>{children}</ChakraProvider>
  </StoreProvider>
);
