// import * as React from 'react';

// import { expect, test } from 'vitest';
// import { fireEvent, render, screen } from '@testing-library/react';

import { ConfirmDialog } from '../components/ConfirmDialog/ConfirmDialog';
import { TestWrapper } from '../setupTests';
import { mount } from '@cypress/react18';

describe('ConfirmDialog', () => {
  it('renders the ConfirmDialog component', () => {
    mount(
      <TestWrapper>
        <ConfirmDialog message={'message'}></ConfirmDialog>
      </TestWrapper>
    );
    cy.get('button').should('exist');
  });

  it('show the modal and message from the ConfirmDialog component', () => {
    mount(
      <TestWrapper>
        <ConfirmDialog message={'message'}></ConfirmDialog>
      </TestWrapper>
    );
    cy.get('button').click();
    cy.get('.chakra-modal__body').should('have.text', 'message');
    cy.findByText('Cancel').should('exist');
    cy.findByText('Confirm Text').should('exist');
    cy.findByText('Cancel').click();
    cy.get('.chakra-modal__body').should('not.exist');
  });
});

// test('Delete', () => {
//   render(
//     <TestWrapper>
//       <ConfirmDialog message={'message'}></ConfirmDialog>
//     </TestWrapper>
//   );

//   const button = document.querySelector('button');
//   expect(button).toBeDefined();

//   fireEvent.click(button);

//   expect(screen.getByText(/Confirm Text/i)).toBeDefined();
//   expect(screen.getByText(/message/i)).toBeDefined();
// });
