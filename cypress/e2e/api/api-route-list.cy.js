describe('Check route list API', () => {
  it('Get 200 status', () => {
    cy.request({
      method: 'GET',
      url: 'https://ctp-otp.etch.app/otp/routers/default/index/routes',
    }).as('getEntries');

    cy.get('@getEntries').should(response => {
      expect(response.status).to.eq(200);
      expect(response).to.have.property('headers');
      //have length > 0
      expect(response.body).to.have.length.greaterThan(10);
    });
  });
});
