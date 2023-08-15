import { Loader } from '../components/Loader/Loader';
import { TestWrapper } from '../setupTests';
import { mount } from '@cypress/react18';

describe('Renders the Loader', () => {
  it('renders the Loader component', () => {
    mount(
      <TestWrapper>
        <Loader isOpen={true} />
      </TestWrapper>
    );
    cy.wait(2000);
    cy.get('.chakra-spinner').should('exist');
  });
});

describe('Renders the Loader', () => {
  it('renders the Loader component', () => {
    mount(
      <TestWrapper>
        <Loader isOpen={false} />
      </TestWrapper>
    );
    cy.wait(2000);
    cy.get('.chakra-spinner').should('not.exist');
  });
});
