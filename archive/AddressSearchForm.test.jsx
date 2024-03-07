import * as React from 'react';

import { act, fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';

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
          label="searchTitle"
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

test('Address Search Form Accepts Default Value', async () => {
  await act(async () =>
    render(
      <TestWrapper>
        <SearchForm
          saveAddress={() => {}}
          center={{ lng: 0, lat: 0 }}
          defaultAddress={'swan st diner'}
          setGeocoderResult={e => {
            result = e;
          }}
          label="Address Search Form"
        ></SearchForm>
      </TestWrapper>
    )
  );
  const el = screen.getByTestId('address-search-input');
  expect(el.value).toBe('swan st diner');
});

test('Address Search Form Gets a Result', async () => {
  const spy = vi.spyOn(global.console, 'log');

  await act(async () =>
    render(
      <TestWrapper>
        <SearchForm
          saveAddress={() => {}}
          center={{ lng: 0, lat: 0 }}
          defaultAddress={'swan st diner'}
          setGeocoderResult={e => {
            result = e;
          }}
          label="Address Search Form"
        ></SearchForm>
      </TestWrapper>
    )
  );
  await (async () => {
    await new Promise(r => setTimeout(r, 2000));
  })();
  expect(spy).toHaveBeenCalled();
  expect(spy).toHaveBeenCalledWith('geocoder result');
  expect(spy).toHaveBeenCalledWith('Swan Street Diner');
  spy.mockRestore();
});
