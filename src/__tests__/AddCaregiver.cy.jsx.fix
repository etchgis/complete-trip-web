import { AddCaregiver } from '../components/Settings/AddCaregiver';
import { TestWrapper } from '../setupTests';
import { mount } from '@cypress/react18';

describe('AddCaregiver', () => {
  it('Add Caregiver Renders', () => {
    mount(
      <TestWrapper>
        <AddCaregiver></AddCaregiver>
      </TestWrapper>
    );
  });

  it('Add Caregiver Button is Disabled and Enabled', () => {
    // cy.on('uncaught:exception', (err, runnable) => {
    //   expect(err).to.include(/please login/i);
    //   done();
    //   // return false;
    // });

    mount(
      <TestWrapper>
        <AddCaregiver></AddCaregiver>
      </TestWrapper>
    );
    cy.get('button').should('exist').should('have.text', 'Invite Caregiver');
    cy.get('button').should('be.disabled');
    cy.findByText(/First Name/i)
      .should('exist')
      .type('Test');
    cy.get('button').click();
    cy.get('input[name="caregiverLastName"]').then($input => {
      expect($input[0].validationMessage).to.eq('Please fill out this field.');
    });
    cy.wait(1000);
    cy.findByText(/Last Name/i)
      .should('exist')
      .type('User');
    cy.get('button').click();
    cy.get('input[name="caregiverEmail"]').then($input => {
      expect($input[0].validationMessage).to.eq('Please fill out this field.');
    });
    cy.wait(1000);
    cy.findByText(/Email/i).type('testuesr@test.com');
    // cy.get('button').click();
  });
});
