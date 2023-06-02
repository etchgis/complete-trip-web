import * as React from 'react';

import { expect, test } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { AddCaregiver } from './AddCaregiver';
import { TestWrapper } from '../../setupTests';

// import { useEffect } from 'react';
// import { useStore } from '../../context/RootStore';

test('Add Caregiver Renders', () => {
  render(
    <TestWrapper>
      <AddCaregiver></AddCaregiver>
    </TestWrapper>
  );

  const button = document.querySelector('button');
  expect(button).toBeDefined();

  // fireEvent.click(button); //TODO submit form and make it fail

  expect(screen.getByText(/First Name/i)).toBeDefined();
  expect(screen.getByText(/Last Name/i)).toBeDefined();
  expect(screen.getByText(/Send Invite/i)).toBeDefined();
  expect(screen.getByText(/Email/i)).toBeDefined();
});
