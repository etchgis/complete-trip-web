import * as React from 'react';

import { render, screen } from '@testing-library/react';

import { EditPassword } from './EditPassword';
import { TestWrapper } from '../../setupTests';

test('EditCaretaker', () => {
  render(
    <TestWrapper>
      <EditPassword></EditPassword>
    </TestWrapper>
  );
  expect(screen.getByText(/Current Password/i)).toBeInTheDocument();
  expect(screen.getByText(/New password/i)).toBeInTheDocument();
});

test('Password Regex', () => {
  const password = 'Password1';
  const regex = new RegExp(
    '(?=[A-Za-z0-9]+$)^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,}).*$'
  );
  expect(regex.test(password)).toBe(true);
  expect(regex.test('pass')).toBe(false);
  expect(regex.test('pass123456')).toBe(false);
  expect(regex.test('PASS123456')).toBe(false);
  expect(regex.test('$%#@!1234')).toBe(false);
});
