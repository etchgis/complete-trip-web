import { render, screen } from '@testing-library/react';

import { ChakraProvider } from '@chakra-ui/react';
import { CustomModal } from './CustomModal';

test('renders the landing page', () => {
  render(
    <ChakraProvider>
      <CustomModal
        title="Test Modal"
        isOpen={true}
        children={<div>Children</div>}
      />
    </ChakraProvider>
  );
  // verify page content for default route
  expect(screen.getByText(/test modal/i)).toBeInTheDocument();
  expect(screen.getByText(/children/i)).toBeInTheDocument();
});
