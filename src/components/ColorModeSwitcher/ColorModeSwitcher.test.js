import '@testing-library/jest-dom';

import * as React from 'react';

import { render, screen } from '@testing-library/react';

import { ChakraProvider } from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';

test('Renders the Login/Register Form', () => {
  render(
    <ChakraProvider>
      <ColorModeSwitcher />
    </ChakraProvider>
  );
  // verify page content for default route
  expect(screen.getByTestId('color-mode-switcher')).toBeInTheDocument();
});
