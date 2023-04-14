import '@testing-library/jest-dom';

import * as React from 'react';

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import { Settings } from './Settings';
import { createMemoryHistory } from 'history';

test('Renders the Settings Page', () => {
  const history = createMemoryHistory({
    initialEntries: ['/'],
  });

  render(

    <Router history={history}>
      <Routes>
        <Route path="/" element={<Settings />} />
      </Routes>
    </Router>

  );
  const exists = screen.getByText(/Account/i);
  expect(exists).toBeInTheDocument();
});

/*
describe('ButtonLogin', () => {
  test('should pass', () => {
    const history = createMemoryHistory({ initialEntries: ['/home'] });
    const { getByText } = render(
      <Router history={history}>
        <ButtonLogin />
      </Router>
    );
    expect(history.location.pathname).toBe('/home');
    fireEvent.click(getByText('Iniciar sesión'));
    expect(history.location.pathname).toBe('/login');
  });
});

*/
