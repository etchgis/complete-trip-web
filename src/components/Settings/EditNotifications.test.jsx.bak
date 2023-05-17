import * as React from 'react';

import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react'

import { EditNotifications } from './EditNotifications';
import { TestWrapper } from "../../setupTests";

test('EditCaretaker', () => {

  render(
    <TestWrapper>
      <EditNotifications></EditNotifications>
    </TestWrapper>
  );
  expect(screen.getByText(/SMS/i)).toBeInTheDocument();
  expect(screen.getByText(/Email/i)).toBeInTheDocument();

});