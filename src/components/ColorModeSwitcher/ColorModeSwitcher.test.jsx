import '@testing-library/jest-dom';

import * as React from 'react';

import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';

import { TestWrapper } from '../../setupTests';
import { ColorModeSwitcher } from './ColorModeSwitcher';

test('Renders the Login/Register Form', () => {
  render(
    <TestWrapper>
      <ColorModeSwitcher />
    </TestWrapper>
  );
  // verify page content for default route
  expect(screen.getByTestId('color-mode-switcher')).toBeInTheDocument();
});
