import * as React from 'react';

import { render, screen } from '@testing-library/react';

import { TestWrapper } from '../../setupTests';
import { VerticalTripPlan } from './VerticalTripPlan';
import plan from '../ScheduleTrip/sample-trip.json';

// import { useEffect } from 'react';
// import { useStore } from '../../context/RootStore';

test('Custom Message', () => {
  render(
    <TestWrapper>
      <VerticalTripPlan plan={plan}></VerticalTripPlan>
    </TestWrapper>
  );

  expect(screen.getByText(/Error/i)).toBeInTheDocument();
  expect(screen.getByText(/message/i)).toBeInTheDocument();
});
