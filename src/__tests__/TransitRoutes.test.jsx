import * as React from 'react';

import { expect, test } from 'vitest';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';

import { TestWrapper } from '../setupTests';
import { TransitRoutes } from '../components/TransitRoutes/TransitRoutes';

test('UI Shows Up', async () => {
  render(
    <TestWrapper route={'/map'}>
      <TransitRoutes></TransitRoutes>
    </TestWrapper>
  );
  const el = await screen.findByText('Find Nearby Routes');
  expect(el).toBeTruthy();
});

test('Input Accepts Value', async () => {
  render(
    <TestWrapper>
      <TransitRoutes></TransitRoutes>
    </TestWrapper>
  );
  const input = await screen.findByPlaceholderText(
    'Start typing an address...'
  );
  fireEvent.change(input, { target: { value: 'Swan St Diner' } });
  expect(input.value).toBe('Swan St Diner');
});

//TODO add test for clicking on the found result and the the route list shows up

test('Waits for Routes to Load', async () => {
  render(
    <TestWrapper route={'/map'}>
      <TransitRoutes></TransitRoutes>
    </TestWrapper>
  );

  const loaderElement = screen.getByTestId('loader');
  expect(loaderElement).toBeTruthy();

  const result = await waitForElementToBeRemoved(
    () => {
      return screen.getByTestId('loader');
    },
    { timeout: 5000 }
  );
  // console.log(result);
  expect(result).toBeFalsy();
});

test('Waits for Route List', async () => {
  render(
    <TestWrapper>
      <TransitRoutes></TransitRoutes>
    </TestWrapper>
  );

  const hasRoutes = await waitFor(() => screen.findByTestId('map-route-list'), {
    timeout: 5000,
  });
  // console.log(hasRoutes);
  expect(hasRoutes.children.length > 0).toBeTruthy();
});

test('Waits for Stop List', async () => {
  render(
    <TestWrapper>
      <TransitRoutes></TransitRoutes>
    </TestWrapper>
  );

  const hasRoutes = await waitFor(() => screen.findByTestId('map-route-list'), {
    timeout: 5000,
  });
  if (hasRoutes.children.length > 0) {
    //click the first route
    fireEvent.click(hasRoutes.children[0]);
    const hasStops = await waitFor(() => screen.findByTestId('map-stoptimes'), {
      timeout: 5000,
    });
    // console.log(hasStops);
    expect(hasStops).toBeTruthy();
  }
});
