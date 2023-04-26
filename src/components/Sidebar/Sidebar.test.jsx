import '@testing-library/jest-dom';

import * as React from 'react';

import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import { ChakraProvider } from '@chakra-ui/react';
import { ResponsiveSidebar } from './Sidebar';

//BUG useNavigate and useLocation need a mocked Router
test('Renders the Desktop Sidebar as a guest user', () => {
  render(
    <ChakraProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <ResponsiveSidebar
                isOpen={false}
                testUser={{ loggedIn: false }}
              />
            }
          />
        </Routes>
      </Router>
    </ChakraProvider>
  );
  const exists = screen.getByText(/Home/i);
  expect(exists).toBeInTheDocument();
  const exists2 = screen.getByText(/map/i);
  expect(exists2).toBeInTheDocument();
  const exists3 = screen.getByText(/trips/i);
  expect(exists3).toBeInTheDocument();
  const exists4 = screen.queryByText(/profile and settings/i);
  expect(exists4).not.toBeInTheDocument();
});

test('Renders the Desktop Sidebar as a logged in user', () => {
  render(
    <ChakraProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <ResponsiveSidebar isOpen={false} testUser={{ loggedIn: true }} />
            }
          />
        </Routes>
      </Router>
    </ChakraProvider>
  );
  const exists4 = screen.queryByText(/profile and settings/i);
  expect(exists4).toBeInTheDocument();
});

test('Renders the mobile sidebar', () => {
  render(
    <ChakraProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <ResponsiveSidebar isOpen={true} testContent={'test content'} />
            }
          />
        </Routes>
      </Router>
    </ChakraProvider>
  );
  const exists = screen.queryByText(/test content/i);
  expect(exists).toBeInTheDocument();
});

test('Does not redner the mobile sidebar', () => {
  render(
    <ChakraProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <ResponsiveSidebar isOpen={false} testContent={'test content'} />
            }
          />
        </Routes>
      </Router>
    </ChakraProvider>
  );
  const exists = screen.queryByText(/test content/i);
  expect(exists).not.toBeInTheDocument();
});
