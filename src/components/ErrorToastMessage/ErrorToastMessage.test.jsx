import * as React from 'react';

import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ErrorToastMessage } from './ErrorToastMessage';
import { TestWrapper } from '../../setupTests';

test('Custom Message', () => {
  render(
    <TestWrapper>
      <ErrorToastMessage message={'message'}></ErrorToastMessage>
    </TestWrapper>
  );

  const exists = screen.queryAllByText(/error/i);
  expect(exists.length).toBeTruthy();
  const message = screen.getByText(/message/i);
  expect(message).toBeDefined();
});
