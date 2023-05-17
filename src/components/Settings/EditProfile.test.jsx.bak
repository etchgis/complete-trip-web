import * as React from 'react';

import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';

import { EditProfile } from './EditProfile';
import { TestWrapper } from '../../setupTests';

test('EditCaretaker', async () => {
  // await act(async () => {
  render(
    <TestWrapper>
      <EditProfile></EditProfile>
    </TestWrapper>
  );
  expect(screen.getByText(/First Name/i)).toBeInTheDocument();
  expect(screen.getByText(/Last Name/i)).toBeInTheDocument();
  expect(screen.getByText(/Phone/i)).toBeInTheDocument();
  expect(screen.getByText(/Email/i)).toBeInTheDocument();
  // });
});
