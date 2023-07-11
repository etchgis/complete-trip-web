import { CreateIcon } from '../components/CreateIcon/CreateIcon';
import { TestWrapper } from '../setupTests';
import { mount } from '@cypress/react18';

describe('CreateIcon', () => {
  it('renders the CreateIcon component', () => {
    mount(
      <TestWrapper>
        <CreateIcon></CreateIcon>
      </TestWrapper>
    );
    cy.get('.chakra-icon').should('exist');
  });
});
