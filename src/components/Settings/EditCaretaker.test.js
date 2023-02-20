import * as React from 'react';

import { render, screen } from '@testing-library/react'

import { EditCaretaker } from './EditCaretaker';
import { TestWrapper } from "../../setupTests";

test('EditCaretaker', () => {

  render(
    <TestWrapper>
      <EditCaretaker id={1}></EditCaretaker>
    </TestWrapper>
  );
  expect(screen.getByText(/First Name/i)).toBeInTheDocument();
  expect(screen.getByText(/Last Name/i)).toBeInTheDocument();
  expect(screen.getByText(/Phone/i)).toBeInTheDocument();
  expect(screen.getByText(/Email/i)).toBeInTheDocument();

});