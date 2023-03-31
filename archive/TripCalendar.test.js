import '@testing-library/jest-dom';

import * as React from 'react';

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import { TestWrapper } from '../../setupTests';
import { TripCalendar } from './TripCalendar';

test('Renders the TripCalendar', () => {
  render(
    <TestWrapper>
      <TripCalendar />
    </TestWrapper>
  );

  expect(screen.getByText(/Trips/i)).toBeInTheDocument();
});
