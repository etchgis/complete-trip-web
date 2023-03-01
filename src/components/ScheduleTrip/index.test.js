import * as React from 'react';

import { render, screen } from '@testing-library/react';

import { ScheduleTrip } from './ScheduleTrip';
import { TestWrapper } from '../../setupTests';

// import { useEffect } from 'react';
// import { useStore } from '../../context/mobx/RootStore';

test('Schedule Trip', () => {
  render(
    <TestWrapper>
      <ScheduleTrip></ScheduleTrip>
    </TestWrapper>
  );

  expect(screen.getByText(/Schedule Trip/i)).toBeInTheDocument();
});
