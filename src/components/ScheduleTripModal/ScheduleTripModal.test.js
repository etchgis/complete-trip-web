import * as React from 'react';

import { render, screen } from '@testing-library/react';

import { ScheduleTripModal } from './ScheduleTripModal';
import { TestWrapper } from '../../setupTests';

// import { useEffect } from 'react';
// import { useStore } from '../../context/RootStore';

/** Basic test to ensure the component renders */
test('Schedule Trip', () => {
  render(
    <TestWrapper>
      <ScheduleTripModal></ScheduleTripModal>
    </TestWrapper>
  );

  expect(screen.getByText(/Schedule a Trip/i)).toBeInTheDocument();
});
