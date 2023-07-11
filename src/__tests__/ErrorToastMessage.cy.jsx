import { ErrorToastMessage } from '../components/ErrorToastMessage/ErrorToastMessage';
import { TestWrapper } from '../setupTests';
import { mount } from '@cypress/react18';

describe('ErrorToastMessage', () => {
  it('renders the ErrorToastMessage component', () => {
    mount(
      <TestWrapper>
        <ErrorToastMessage message={'message'}></ErrorToastMessage>
      </TestWrapper>
    );
    //TODO potential bug here - should only one message be allowed at a time?
    cy.get('.chakra-toast').should('exist');
    cy.findByText('message').should('exist');
    cy.wait(2000);
    cy.get('[aria-label="Close"]').click({ multiple: true });
    cy.wait(2000);
    cy.get('.chakra-toast').should('not.exist');
  });
});
