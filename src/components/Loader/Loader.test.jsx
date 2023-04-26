import '@testing-library/jest-dom';

import * as React from 'react';

import { expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';

import { ChakraProvider } from '@chakra-ui/react';
import { Loader } from './Loader';

test('Renders the Loader', () => {
  render(
    <ChakraProvider>
      <Loader isOpen={true} />
    </ChakraProvider>
  );
  const exists = screen.queryByTestId('loader');
  expect(exists).not.toBeNull();
});

test('Does not renders the Loader', () => {
  render(
    <ChakraProvider>
      <Loader isOpen={false} />
    </ChakraProvider>
  );
  const exists = screen.queryByTestId('loader') || null;
  expect(exists).toBeNull();
});
