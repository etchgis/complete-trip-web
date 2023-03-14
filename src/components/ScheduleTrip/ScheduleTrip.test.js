import * as React from 'react';

import { render, screen } from '@testing-library/react';

import { ScheduleTrip } from './ScheduleTrip';
import { TestWrapper } from '../../setupTests';

// import { useEffect } from 'react';
// import { useStore } from '../../context/RootStore';

/** Basic test to ensure the component renders */
test('Schedule Trip', () => {
  render(
    <TestWrapper>
      <ScheduleTrip></ScheduleTrip>
    </TestWrapper>
  );

  expect(screen.getByText(/Schedule a Trip/i)).toBeInTheDocument();
});
