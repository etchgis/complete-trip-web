import * as React from 'react';

import { render, screen } from '@testing-library/react';

import { ErrorToastMessage } from './ErrorToastMessage';
import { TestWrapper } from '../../setupTests';

// import { useEffect } from 'react';
// import { useStore } from '../../context/mobx/RootStore';

test('Custom Message', () => {
  render(
    <TestWrapper>
      <ErrorToastMessage message={'message'}></ErrorToastMessage>
    </TestWrapper>
  );

  expect(screen.getByText(/Error/i)).toBeInTheDocument();
  expect(screen.getByText(/message/i)).toBeInTheDocument();
});
