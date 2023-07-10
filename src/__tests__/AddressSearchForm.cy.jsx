import '@testing-library/cypress/add-commands';

import { SearchForm } from '../components/AddressSearchForm/AddressSearchForm';
import { TestWrapper } from '../setupTests';
import { mount } from '@cypress/react18';

describe('AddressSearchForm', () => {
  it('renders the SearchForm component', () => {
    mount(
      <TestWrapper>
        <SearchForm
          key={1}
          saveAddress={() => {}}
          center={{ lng: 0, lat: 0 }}
          defaultAddress={''}
          setGeocoderResult={() => {}}
        ></SearchForm>
      </TestWrapper>
    );
  });

  it('uses default value in the SearchForm component', () => {
    mount(
      <TestWrapper>
        <SearchForm
          key={2}
          saveAddress={() => {}}
          center={{ lng: 0, lat: 0 }}
          defaultAddress={'Swan St Diner'}
          setGeocoderResult={() => {}}
        ></SearchForm>
      </TestWrapper>
    );
    cy.get('input').should('have.value', 'Swan St Diner');
  });
});

describe('AddressSearchForm Results', () => {
  it('form returns a result in the SearchForm component', () => {
    mount(
      <TestWrapper>
        <SearchForm
          key={3}
          saveAddress={() => {}}
          center={{ lng: 0, lat: 0 }}
          defaultAddress={'b'}
          setGeocoderResult={() => {}}
        ></SearchForm>
      </TestWrapper>
    );
    cy.get('[data-testid="address-search-overlay"]').should('not.exist');
    cy.get('input').should('exist');
    cy.get('input')
      .clear()
      .type('Sahlen Fi', { force: true })
      .trigger('change');
    cy.get('input').should('have.value', 'Sahlen Fi');
    cy.get('input').trigger('keydown', { keyCode: 13 });
    cy.get('input').trigger('keydown', { keyCode: 40 });
    cy.get('input').trigger('keydown', { keyCode: 40 });
    cy.get('[data-testid="address-search-overlay"]').should('exist');
  });
});
