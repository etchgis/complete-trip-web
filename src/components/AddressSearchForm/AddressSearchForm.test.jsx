import * as React from 'react';

import { act, fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

import { SearchForm } from './AddressSearchForm';
import { TestWrapper } from '../../setupTests';

/**
 * Basic test to ensure the component renders
 */
test('Address Search Form Renders', async () => {
  await act(async () =>
    render(
      <TestWrapper>
        <SearchForm
          saveAddress={() => {}}
          center={{ lng: 0, lat: 0 }}
          defaultAddress={''}
          setGeocoderResult={() => {}}
        ></SearchForm>
      </TestWrapper>
    )
  );
  const el = await screen.findByPlaceholderText('Start typing an address...');
  expect(el).toBeTruthy();
});

test('Address Search Form Accepts Input', async () => {
  await act(async () =>
    render(
      <TestWrapper>
        <SearchForm
          saveAddress={() => {}}
          center={{ lng: 0, lat: 0 }}
          defaultAddress={''}
          setGeocoderResult={() => {}}
        ></SearchForm>
      </TestWrapper>
    )
  );
  const el = await screen.findByPlaceholderText('Start typing an address...');
  //add an input to el
  fireEvent.change(el, { target: { value: 'Swan St Diner' } });
  expect(el.value).toBe('Swan St Diner');
});

//TODO add test for if the result list shows up when a value is entered
