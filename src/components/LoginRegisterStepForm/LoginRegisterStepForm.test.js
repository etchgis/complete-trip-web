import '@testing-library/jest-dom';

import * as React from 'react';

import { render, screen } from '@testing-library/react';

import { ChakraProvider } from '@chakra-ui/react';
import { LoginRegisterStepForm } from './LoginRegisterStepForm';

test('Renders the Login/Register Form', () => {
  render(
    <ChakraProvider>
      <LoginRegisterStepForm testStore={{ name: 'Test' }} />
    </ChakraProvider>
  );
  // verify page content for default route
  expect(screen.getByText(/login/i)).toBeInTheDocument();
  expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  expect(screen.getByText(/continue as guest/i)).toBeInTheDocument();
});
