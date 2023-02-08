import '@testing-library/jest-dom';

import * as React from 'react';

import { render, screen } from '@testing-library/react';

import { ChakraProvider } from '@chakra-ui/react';
import { ResponsiveSidebar } from './Sidebar';

//BUG useNavigate and useLocation need a mocked Router
test('Renders the Sidebar', () => {
  render(
    <ChakraProvider>
      <ResponsiveSidebar isOpen={true} />
    </ChakraProvider>
  );
  const exists = screen.queryByTestId('desktop-sidebar');
  expect(exists).not.toBeNull();
});

test('Does not renders the Sidebar', () => {
  render(
    <ChakraProvider>
      <ResponsiveSidebar isOpen={false} />
    </ChakraProvider>
  );
  const exists = screen.queryByTestId('mobile-sidebar') || null;
  expect(exists).toBeNull();
});
