import '@testing-library/jest-dom';

import * as React from 'react';

import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';

import { TestWrapper } from '../../setupTests';
import { Loader } from './Loader';

test('Renders the Loader', () => {
  render(
    <TestWrapper>
      <Loader isOpen={true} />
    </TestWrapper>
  );
  const exists = screen.queryByTestId('loader');
  expect(exists).not.toBeNull();
});

test('Does not renders the Loader', () => {
  render(
    <TestWrapper>
      <Loader isOpen={false} />
    </TestWrapper>
  );
  const exists = screen.queryByTestId('loader') || null;
  expect(exists).toBeNull();
});
