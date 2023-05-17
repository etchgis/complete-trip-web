import { render, screen } from '@testing-library/react';

import { Navbar } from './Navbar';
import { TestWrapper } from '../../setupTests';

test('Renders the Navbar', () => {
  render(
    <TestWrapper>
      <Navbar />
    </TestWrapper>
  );
  // verify page content for default route
  expect(screen.getByText(/login\/sign up/i)).toBeTruthy();
});
