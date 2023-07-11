import { TestWrapper } from '../setupTests';
import { TripPlanSchedule } from '../components/VerticalTripPlan/TripPlanSchedule';
import { mount } from '@cypress/react18';
import plan from '../components/VerticalTripPlan/sample-trip-plan.json';
/**
 * Basic test to ensure the component renders
 */
describe('TripPlanSchedule', () => {
  it('Trip Plan Schedule Renders', async () => {
    mount(
      <TestWrapper>
        <TripPlanSchedule
          tripRequest={{ destination: { title: 'Trip', description: 'Title' } }}
          tripPlan={plan}
        ></TripPlanSchedule>
      </TestWrapper>
    );
    cy.get('#trip-plan-schedule').should('exist');
    cy.findByText(/Trip Title/i).should('exist');
    cy.findByText(/0 transfers/i).should('exist');
    cy.findByText(/Drive 11 mins/i).should('exist');
  });
});
