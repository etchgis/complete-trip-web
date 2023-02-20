import * as React from 'react';

import { render, screen } from '@testing-library/react'

import { EditTripPreferences } from './EditTripPreferences';
import { TestWrapper } from "../../setupTests";

test('EditCaretaker', () => {

  render(
    <TestWrapper>
      <EditTripPreferences></EditTripPreferences>
    </TestWrapper>
  );
  expect(screen.getByText(/Minimize Walking/i)).toBeInTheDocument();
  expect(screen.getByText(/wheelchair/i)).toBeInTheDocument();
});