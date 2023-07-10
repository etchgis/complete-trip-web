import '@testing-library/cypress/add-commands';

import { ColorModeSwitcher } from '../components/ColorModeSwitcher/ColorModeSwitcher';
import { TestWrapper } from '../setupTests';
import { mount } from '@cypress/react18';

describe('ColorModeSwitcher', () => {
  it('renders the ColorModeSwitcher component', () => {
    mount(
      <TestWrapper>
        <ColorModeSwitcher />
      </TestWrapper>
    );
    cy.get(`[aria-label="Switch to light mode"]`).should('not.exist');
  });

  it('toggles color mode', () => {
    mount(
      <TestWrapper>
        <ColorModeSwitcher />
      </TestWrapper>
    );
    cy.get(`[aria-label="Switch to dark mode"]`).should('exist');
    cy.get(`[aria-label="Switch to light mode"]`).should('not.exist');
    cy.get('button').click();
    cy.get(`[aria-label="Switch to dark mode"]`).should('not.exist');
    cy.get(`[aria-label="Switch to light mode"]`).should('exist');
  });
});
