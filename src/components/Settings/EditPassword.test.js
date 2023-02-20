import * as React from 'react';

import { render, screen } from '@testing-library/react'

import { EditPassword } from './EditPassword';
import { TestWrapper } from "../../setupTests";

test('EditCaretaker', () => {

  render(
    <TestWrapper>
      <EditPassword></EditPassword>
    </TestWrapper>
  );
  expect(screen.getByText(/Current Password/i)).toBeInTheDocument();
  expect(screen.getByText(/Forgot password/i)).toBeInTheDocument();
  expect(screen.getByText(/New password/i)).toBeInTheDocument();


});