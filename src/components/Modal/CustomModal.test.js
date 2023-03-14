import { render, screen } from '@testing-library/react';

import { CustomModal } from './CustomModal';
import { TestWrapper } from '../../setupTests';

test('renders the landing page', () => {
  render(
    <TestWrapper>
      <CustomModal
        title="Test Modal"
        isOpen={true}
        children={<div>Children</div>}
      />
    </TestWrapper>
  );
  // verify page content for default route
  expect(screen.getByText(/test modal/i)).toBeInTheDocument();
  expect(screen.getByText(/children/i)).toBeInTheDocument();
});
