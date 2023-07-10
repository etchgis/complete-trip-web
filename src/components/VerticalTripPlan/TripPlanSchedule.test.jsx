import * as React from 'react';

import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';

import { TestWrapper } from '../../setupTests';
import { TripPlanSchedule } from './TripPlanSchedule';
import plan from './sample-trip-plan.json';

/**
 * Basic test to ensure the component renders
 */
test('Trip Plan Schedule Renders', async () => {
  render(
    <TestWrapper>
      <TripPlanSchedule
        tripRequest={{ destination: { title: 'Trip', description: 'Title' } }}
        tripPlan={plan}
      ></TripPlanSchedule>
    </TestWrapper>
  );
  const el = screen.getByTestId('trip-plan-schedule');
  expect(el).toBeTruthy();
  expect(screen.getByText(/Trip Title/i)).toBeTruthy();
  expect(screen.getByText(/0 transfers/i)).toBeTruthy();
  expect(screen.getByText(/Drive 11 mins/i)).toBeTruthy();
});
