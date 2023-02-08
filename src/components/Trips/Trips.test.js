import '@testing-library/jest-dom';

import * as React from 'react';

import { render, screen } from '@testing-library/react';

import { ChakraProvider } from '@chakra-ui/react';
import { Trips } from './Trips';

//BUG value.toDate is not a function
test('Renders the Trips Calendar', () => {
  const date = {
    calendar: {
      identifier: 'gregory',
    },
    era: 'AD',
    year: 2023,
    month: 2,
    day: 8,
  };
  render(
    <ChakraProvider>
      <Trips testDate={date} />
    </ChakraProvider>
  );
  const exists = screen.getByText(/SUN MON TUE WED THUR FRI/i);
  expect(exists).toBeInTheDocument();
});
