import * as React from 'react';

import { render, screen } from '@testing-library/react';

import { SearchForm } from './AddressSearchForm';
import { TestWrapper } from '../../setupTests';
import { act } from 'react-dom/test-utils';

/**
 * Basic test to ensure the component renders
 */
test('Address Search Form', async () => {
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

  expect(screen.getByText(/Home Address/i)).toBeInTheDocument();
  // expect(screen.getByText(/11:39/i)).toBeInTheDocument();
  expect(
    screen.queryByPlaceholderText('Start typing an address...')
  ).toBeInTheDocument();
});