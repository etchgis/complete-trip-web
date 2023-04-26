import * as React from 'react';

import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react'

import { EditAccessibility } from './EditAccessibility';
import { TestWrapper } from "../../setupTests";

test('Accessibility', () => {

  render(
    <TestWrapper>
      <EditAccessibility></EditAccessibility>
    </TestWrapper>
  );
  const exists = screen.getByText(/Language/i);
  expect(exists).toBeInTheDocument();
});