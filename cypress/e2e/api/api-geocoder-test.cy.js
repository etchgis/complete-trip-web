// About API testing: https://docs.cypress.io/api/commands/request#Method-and-URL

import config from '../../../src/config';

const url = `${config.SERVICES.geocode}/?query=${encodeURIComponent(
  'Swan Street Diner'
)}&limit=10&org=${config.ORGANIZATION}`;
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
