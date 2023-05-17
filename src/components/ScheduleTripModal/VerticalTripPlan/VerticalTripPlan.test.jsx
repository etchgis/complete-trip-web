import * as React from 'react';

import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';

import { TestWrapper } from '../../../setupTests';
import { VerticalTripPlan } from './VerticalTripPlan';
import plan from '../sample-trip.json';

/**
 * Basic test to ensure the component renders
 */
test('Vertical Trip Plan Renders', async () => {
  render(
    <TestWrapper>
      <VerticalTripPlan requst={{}} plan={plan}></VerticalTripPlan>
    </TestWrapper>
  );
  const el = await screen.findByTestId('vertical-trip-plan');
  expect(el).toBeTruthy();
  expect(screen.getByText(/LaSalle Station/i)).toBeTruthy();
  expect(screen.getByText(/1 Transfer/i)).toBeTruthy();
});
