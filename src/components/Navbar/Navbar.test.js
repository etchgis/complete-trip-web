import { render, screen } from '@testing-library/react';

import { ChakraProvider } from '@chakra-ui/react';
import { Navbar } from './Navbar';

test('renders the landing page', () => {
  render(
    <ChakraProvider>
      <Navbar />
    </ChakraProvider>
  );
  // verify page content for default route
  expect(screen.getByText(/login\/sign up/i)).toBeInTheDocument();
});
