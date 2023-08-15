import { LoginRegister } from '../components/LoginRegister/LoginRegister';
import { TestWrapper } from '../setupTests';
import { mount } from '@cypress/react18';

describe('LoginRegister', () => {
  it('Renders the Login/Register Form', () => {
    mount(
      <TestWrapper>
        <LoginRegister />
      </TestWrapper>
    );
    // verify page content for default route
    cy.findByText(/login/i).should('exist');
    cy.findByText(/sign up/i).should('exist');
    cy.findByText(/continue as guest/i).should('exist');
  });
});

//TODO add flow ->

/*

click signup
add first name
add last name
add password
click terms
click accept
*/

/*no first name does not continue
no last name does not continue
no password does not continue
no terms does not continue
no email does not continue
*/
