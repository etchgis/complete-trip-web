import '@testing-library/jest-dom';

import * as React from 'react';

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import { Navbar } from './Navbar';
import { TestWrapper } from '../../setupTests';
import { createMemoryHistory } from 'history';

test('Renders the Navbar', () => {
  const history = createMemoryHistory({
    initialEntries: ['/'],
  });
  render(
    <TestWrapper>
      <Router history={history}>
        <Routes>
          <Route path="/" element={<Navbar />} />
        </Routes>
      </Router>
    </TestWrapper>
  );
  // verify page content for default route
  expect(screen.getByText(/login\/sign up/i)).toBeInTheDocument();
});

// test('shows the children when the checkbox is checked', () => {
//   const testMessage = 'Test Message'
//   render(<HiddenMessage>{testMessage}</HiddenMessage>)

//   // query* functions will return the element or null if it cannot be found
//   // get* functions will return the element or throw an error if it cannot be found
//   expect(screen.queryByText(testMessage)).toBeNull()

//   // the queries can accept a regex to make your selectors more resilient to content tweaks and changes.
//   // fireEvent.click(screen.getByLabelText(/show/i))

//   // .toBeInTheDocument() is an assertion that comes from jest-dom
//   // otherwise you could use .toBeDefined()
//   expect(screen.getByText(testMessage)).toBeInTheDocument()
// })