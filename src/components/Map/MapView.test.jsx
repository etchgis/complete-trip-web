import * as React from 'react';

import { expect, test } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { MapView } from './MapView';
import { TestWrapper } from '../../setupTests';
import {
  BrowserRouter as Router,
} from 'react-router-dom';
import RootStore, { StoreProvider } from '../../context/RootStore';

const store = new RootStore();

test('Delete', () => {
  render(
    <TestWrapper>
      <StoreProvider store={store}>
        <Router>
          <MapView showMap={true}></MapView>
        </Router>
      </StoreProvider>
    </TestWrapper>
  );

  // const button = document.querySelector('button');
  // expect(button).toBeDefined();

  // fireEvent.click(button);

  expect(screen.getByText(/Schedule a Trip/i)).toBeDefined();
  // expect(screen.getByText(/message/i)).toBeDefined();
});
