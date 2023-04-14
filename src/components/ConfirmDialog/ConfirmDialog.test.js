import * as React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { ConfirmDialog } from './ConfirmDialog';
import { TestWrapper } from '../../setupTests';

// import { useEffect } from 'react';
// import { useStore } from '../../context/RootStore';

test('Delete', () => {
  render(
    <TestWrapper>
      <ConfirmDialog message={'message'}></ConfirmDialog>
    </TestWrapper>
  );

  const button = document.querySelector('button');
  expect(button).toBeInTheDocument();

  fireEvent.click(button);
  expect(screen.getByText(/Confirm Text/i)).toBeInTheDocument();
  expect(screen.getByText(/message/i)).toBeInTheDocument();
});
