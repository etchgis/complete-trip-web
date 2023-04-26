import * as React from 'react';

import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';

import { TestWrapper } from '../../../setupTests';
import { VerticalTripPlan } from './VerticalTripPlan';
import plan from '../sample-trip.json';

/**
 * Basic test to ensure the component renders
 */
test('Vertical Trip Plan', () => {
  render(
    <TestWrapper>
      <VerticalTripPlan requst={{}} plan={plan}></VerticalTripPlan>
    </TestWrapper>
  );

  expect(screen.getByText(/LaSalle Station/i)).toBeInTheDocument();
  expect(screen.getByText(/11:39/i)).toBeInTheDocument();
});
