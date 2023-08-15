import { Navbar } from '../components/Navbar/Navbar';
import { TestWrapper } from '../setupTests';
import { mount } from '@cypress/react18';

describe('Navbar', () => {
  it('Renders the Navbar', () => {
    mount(
      <TestWrapper>
        <Navbar />
      </TestWrapper>
    );
    cy.findByText(/login\/sign up/i).should('exist');
  });
  it('Toggles between light and dark mode', () => {
    mount(
      <TestWrapper>
        <Navbar />
      </TestWrapper>
    );
    cy.wait(2000);
    cy.get('[aria-label="Switch to dark mode"]').should('exist').click();
    cy.wait(2000);
    cy.get('[aria-label="Switch to light mode"]').should('exist');
    cy.get('[aria-label="Switch to dark mode"]').should('not.exist');
  });
});
