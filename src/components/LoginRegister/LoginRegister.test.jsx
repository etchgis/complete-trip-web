import '@testing-library/jest-dom';

import * as React from 'react';

import { render, screen } from '@testing-library/react';

import { LoginRegister } from './LoginRegister';
import { TestWrapper } from '../../setupTests';

test('Renders the Login/Register Form', () => {
  render(
    <TestWrapper>
      <LoginRegister />
    </TestWrapper>
  );
  // verify page content for default route
  expect(screen.getByText(/login/i)).toBeInTheDocument();
  expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  expect(screen.getByText(/continue as guest/i)).toBeInTheDocument();
});