/// <reference types="cypress" />
// About API testing: https://docs.cypress.io/api/commands/request#Method-and-URL

const url = `https://511ny.etch.app/geocode?query=${encodeURIComponent(
  'Swan Street Diner'
)}&limit=10`;
console.log(url);
describe('Check geocoder request', () => {
  it('Get 200 status', () => {
    cy.request({
      method: 'GET',
      url: url,
    }).as('getEntries');

    cy.get('@getEntries').should(response => {
      expect(response.status).to.eq(200);
      expect(response).to.have.property('headers');
      expect(response.body[0]).to.have.property('title');
      expect(response.body[0]?.title).to.eq('Swan Street Diner');
    });
  });
});

describe('Check route list API', () => {
  it('Get 200 status', () => {
    cy.request({
      method: 'GET',
      url: 'https://ctp-otp.etch.app/otp/routers/default/index/routes',
    }).as('getEntries');

    cy.get('@getEntries').should(response => {
      expect(response.status).to.eq(200);
      expect(response).to.have.property('headers');
      //hjave length > 0
      expect(response.body).to.have.length.greaterThan(10);
    });
  });
});
