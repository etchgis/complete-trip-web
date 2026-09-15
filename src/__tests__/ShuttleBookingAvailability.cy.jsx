import RootStore, { StoreProvider } from '../context/RootStore';
import { useEffect, useState } from 'react';

import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import {
  Second,
  TripResults,
} from '../components/ScheduleTripModal/ScheduleTripModal';
import { screenShuttlePickups } from '../hooks/useServiceAvailability';
import ShuttleSummonModal from '../components/VerticalTripPlan/ShuttleSummonModal';
import { TransitRoutes } from '../components/TransitRoutes/TransitRoutes';
import config from '../config';
import { mount } from '@cypress/react18';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import { theme } from '../theme';

// Every shuttle booking decision comes from the service's availability check,
// never from hours written into the app.
const CHECK_URL = `${config.SERVICES.skids.url}/services/availability/${config.HDS_SERVICE_ID}/check*`;
const RIDE_URL = `${config.SERVICES.rides.url}/request`;
const PLAN_LINK_URL = `${config.SERVICES.plans.url}/ride/*`;

const OPEN = {
  isAvailable: true,
  todayHours: [{ start: '10:30', end: '14:30' }],
  hoursDisplay: '10:30 AM - 2:30 PM',
};

const CLOSED = {
  isAvailable: false,
  reason: 'outside_hours',
  details: 'Operating hours: 10:30 AM - 2:30 PM',
  nextAvailable: { date: '2026-09-16', window: { start: '10:30', end: '14:30' } },
  todayHours: [{ start: '10:30', end: '14:30' }],
  hoursDisplay: '10:30 AM - 2:30 PM',
};

// What the check sends for a service it holds no configuration for.
const NO_HOURS = { isAvailable: true, todayHours: [] };

const DOWN = { statusCode: 503, body: { message: 'down' } };

const NOT_AVAILABLE = 'Sorry, but this shuttle is not available at this time.';
const UNCONFIRMED =
  "We can't confirm the shuttle is running right now. Please try again.";

// Longer than the app waits for the check, so a test can see it give up.
const SLOW_MS = 8000;

const withStore = (store, children) => (
  <MemoryRouter>
    <StoreProvider store={store}>
      <ChakraProvider theme={theme}>{children}</ChakraProvider>
    </StoreProvider>
  </MemoryRouter>
);

// A scheduled route tile, which loads its stops rather than booking anything.
const BUS_ROUTE = {
  mode: 'bus',
  service: 'nfta-metro',
  name: 'Route 12',
  route: { patternId: 'p1', shortName: '12' },
};

const mountRoutes = (onShuttlePress, alsoOnScreen = []) => {
  const store = new RootStore();
  store.uiStore.setUX('webapp');
  store.mapStore.setMapState('routesLoading', false);
  store.mapStore.setMapState('routes', [
    {
      mode: 'shuttle',
      service: config.HDS_SERVICE_ID,
      name: 'NFTA Community Shuttle',
    },
    ...alsoOnScreen,
  ]);
  mount(withStore(store, <TransitRoutes onShuttlePress={onShuttlePress} />));
};

const mountModes = (when, { whenAction = 'leave', modes, preferredModes } = {}) => {
  const store = new RootStore();
  store.trip.create();
  store.trip.updateWhen(when);
  store.trip.updateWhenAction(whenAction);
  (modes || []).forEach(mode => store.trip.addMode(mode));
  if (preferredModes) {
    runInAction(() => {
      store.authentication.user = { profile: { preferences: { modes: preferredModes } } };
    });
  }
  mount(
    withStore(
      store,
      <Second
        setStep={() => {}}
        trip={store.trip}
        setSelectedTrip={() => {}}
      />
    )
  );
  return store;
};

// The summon form with a valid PIN and phone already typed in.
const SummonForm = ({ onSuccess }) => {
  const [pin, setPin] = useState('');
  const [areaCode, setAreaCode] = useState('');
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    setPin('1234');
    setAreaCode('716');
    setPhone1('555');
    setPhone2('0100');
  }, []);
  return (
    <ShuttleSummonModal
      isOpen
      onClose={() => {}}
      onSuccess={onSuccess}
      pin={pin}
      setPin={setPin}
      areaCode={areaCode}
      setAreaCode={setAreaCode}
      phone1={phone1}
      setPhone1={setPhone1}
      phone2={phone2}
      setPhone2={setPhone2}
      error={error}
      setError={setError}
    />
  );
};

const mountSummon = onSuccess => {
  const store = new RootStore();
  store.uiStore.setUX('webapp');
  store.trip.create();
  store.trip.updateDestination({
    title: 'Buffalo General Medical Center',
    address: '100 High St, Buffalo, NY',
    point: { lat: 42.9003, lng: -78.8662 },
  });
  mount(withStore(store, <SummonForm onSuccess={onSuccess} />));
};

// A plan that rides the community shuttle, with the fields a trip card shows.
const shuttleTripPlan = pickup => {
  const startTime = pickup.getTime();
  const endTime = startTime + 15 * 60000;
  return {
    startTime,
    endTime,
    duration: 900,
    legs: [
      {
        mode: 'HAIL',
        startTime,
        endTime,
        agencyId: 'BNMC',
        routeShortName: 'Community Shuttle',
      },
    ],
  };
};

// A store holding the results of a search, screened by the real availability
// checks, so the screen is shown exactly what a search would leave it.
const storeWithPlans = (plans, { language } = {}) => {
  const store = new RootStore();
  if (language) store.uiStore.setUI({ language });
  store.trip.create();
  cy.wrap(null)
    .then(() => screenShuttlePickups(plans))
    .then(screened => {
      runInAction(() => {
        store.trip.plans = screened.plans;
        store.trip.shuttleNotice = {
          closed: screened.closed,
          unconfirmed: screened.unconfirmed,
        };
      });
    });
  return store;
};

const ResultsView = observer(({ trip }) => (
  <TripResults
    trip={trip}
    trips={trip.plans}
    setStep={() => {}}
    setSelectedTrip={() => {}}
  />
));

const mountResults = store => mount(withStore(store, <ResultsView trip={store.trip} />));

const SUMMON_BUTTON = '[data-test-id="summon-shuttle-button"]';
const SHUTTLE_TILE = '[data-testid="map-route-list-button"]';

const interceptRide = () => {
  cy.intercept('POST', RIDE_URL, { statusCode: 200, body: { id: 'ride-1' } }).as('ride');
  cy.intercept('PATCH', PLAN_LINK_URL, { statusCode: 200, body: {} });
};

// A reply held past the app's timeout is still on its way when the test ends.
// Waiting for it here keeps it from landing in the next test.
const waitOutSlowReply = () => cy.wait('@check', { timeout: SLOW_MS + 2000 });

// Summon Shuttle checks the PIN and phone first, so taps wait until the form
// has them filled in.
const summonFormFilled = () =>
  cy.get('input[name="phone2"]').should('have.value', '0100');

// Three taps inside one frame, before the screen has had a chance to show that
// the first one is being handled.
const tapThreeTimes = selector =>
  cy.get(selector).then($el => {
    $el[0].click();
    $el[0].click();
    $el[0].click();
  });

// The browser clock is pinned to a time on the other side of the check's
// answer from any fixed business-hours guess, so the test only passes when the
// check decides.
const pinClock = (hour, minute = 0) =>
  cy.clock(new Date(2026, 8, 15, hour, minute).getTime(), ['Date']);

describe('tapping the community shuttle on the kiosk route list', () => {
  it('tells the rider it is not available when the check says it is closed', () => {
    pinClock(11);
    cy.intercept('GET', CHECK_URL, CLOSED).as('check');
    const onShuttlePress = cy.stub().as('press');
    mountRoutes(onShuttlePress);

    cy.get(SHUTTLE_TILE).click();
    cy.wait('@check');
    cy.contains(NOT_AVAILABLE).should('be.visible');
    cy.get('@press').should('not.have.been.called');
  });

  it('starts the booking when the check says it is running', () => {
    pinClock(7, 30);
    cy.intercept('GET', CHECK_URL, OPEN).as('check');
    const onShuttlePress = cy.stub().as('press');
    mountRoutes(onShuttlePress);

    cy.get(SHUTTLE_TILE).click();
    cy.wait('@check');
    cy.get('@press').should('have.been.calledOnce');
  });

  it('refuses as unconfirmed, not as closed, when the check fails', () => {
    cy.intercept('GET', CHECK_URL, DOWN).as('check');
    const onShuttlePress = cy.stub().as('press');
    mountRoutes(onShuttlePress);

    cy.get(SHUTTLE_TILE).click();
    cy.wait('@check');
    cy.contains(UNCONFIRMED).should('be.visible');
    cy.contains(NOT_AVAILABLE).should('not.exist');
    cy.get('@press').should('not.have.been.called');
  });

  it('refuses as unconfirmed when the check does not answer in time', () => {
    cy.intercept('GET', CHECK_URL, req => {
      req.reply({ delay: SLOW_MS, body: OPEN });
    }).as('check');
    const onShuttlePress = cy.stub().as('press');
    mountRoutes(onShuttlePress);

    cy.get(SHUTTLE_TILE).click();
    cy.contains(UNCONFIRMED, { timeout: SLOW_MS }).should('be.visible');
    cy.get('@press').should('not.have.been.called');
    waitOutSlowReply();
  });

  it('shows the tile as busy while checking and presses once for repeated taps', () => {
    // Each reply is quick enough that a tap the guard failed to hold would get
    // its own answer and open the booking, rather than timing out unnoticed.
    let asked = 0;
    cy.intercept('GET', CHECK_URL, req => {
      asked += 1;
      req.reply({ delay: 250, body: OPEN });
    }).as('check');
    const onShuttlePress = cy.stub().as('press');
    mountRoutes(onShuttlePress);

    tapThreeTimes(SHUTTLE_TILE);
    cy.get(SHUTTLE_TILE).should('have.attr', 'aria-busy', 'true');
    cy.wait('@check');
    cy.get('@press').should('have.been.calledOnce');
    cy.get(SHUTTLE_TILE).should('not.have.attr', 'aria-busy', 'true');

    // Three more taps, each one answered, and still one booking each.
    tapThreeTimes(SHUTTLE_TILE);
    cy.get('@press').should('have.been.calledTwice');
    cy.wrap(null).should(() => {
      expect(asked).to.equal(2);
    });
  });

  it('ignores a check that answers after the rider has tapped another route', () => {
    cy.intercept('GET', CHECK_URL, req => {
      req.reply({ delay: 1500, body: OPEN });
    }).as('check');
    cy.intercept('GET', '**/feed/**', { statusCode: 200, body: {} }).as('stops');
    const onShuttlePress = cy.stub().as('press');
    mountRoutes(onShuttlePress, [BUS_ROUTE]);

    cy.get(SHUTTLE_TILE).first().click();
    cy.get(SHUTTLE_TILE).last().click();
    cy.wait('@check');
    cy.get('@press').should('not.have.been.called');
    cy.contains(NOT_AVAILABLE).should('not.exist');
    cy.contains(UNCONFIRMED).should('not.exist');
  });
});

describe('summoning the shuttle from the kiosk', () => {
  it('checks the shuttle again at summon time and creates the ride when it is running', () => {
    cy.intercept('GET', CHECK_URL, OPEN).as('check');
    interceptRide();
    const onSuccess = cy.stub().as('success');
    mountSummon(onSuccess);

    summonFormFilled();
    cy.get(SUMMON_BUTTON).click();
    cy.wait('@check');
    cy.wait('@ride');
    cy.get('@success').should('have.been.calledOnce');
  });

  it('refuses when the shuttle has closed by summon time', () => {
    cy.intercept('GET', CHECK_URL, CLOSED).as('check');
    interceptRide();
    const onSuccess = cy.stub().as('success');
    mountSummon(onSuccess);

    summonFormFilled();
    cy.get(SUMMON_BUTTON).click();
    cy.wait('@check');
    cy.contains(NOT_AVAILABLE).should('be.visible');
    cy.get('@ride.all').should('have.length', 0);
    cy.get('@success').should('not.have.been.called');
  });

  it('refuses as unconfirmed when the check fails', () => {
    cy.intercept('GET', CHECK_URL, DOWN).as('check');
    interceptRide();
    mountSummon(cy.stub());

    summonFormFilled();
    cy.get(SUMMON_BUTTON).click();
    cy.wait('@check');
    cy.contains(UNCONFIRMED).should('be.visible');
    cy.contains(NOT_AVAILABLE).should('not.exist');
    cy.get('@ride.all').should('have.length', 0);
  });

  it('refuses as unconfirmed when the service has no hours on record', () => {
    cy.intercept('GET', CHECK_URL, NO_HOURS).as('check');
    interceptRide();
    mountSummon(cy.stub());

    summonFormFilled();
    cy.get(SUMMON_BUTTON).click();
    cy.wait('@check');
    cy.contains(UNCONFIRMED).should('be.visible');
    cy.get('@ride.all').should('have.length', 0);
  });

  it('refuses as unconfirmed when the check does not answer in time', () => {
    cy.intercept('GET', CHECK_URL, req => {
      req.reply({ delay: SLOW_MS, body: OPEN });
    }).as('check');
    interceptRide();
    mountSummon(cy.stub());

    summonFormFilled();
    cy.get(SUMMON_BUTTON).click();
    cy.contains(UNCONFIRMED, { timeout: SLOW_MS }).should('be.visible');
    cy.get('@ride.all').should('have.length', 0);
    waitOutSlowReply();
  });

  it('creates one ride for repeated taps while the check is out', () => {
    cy.intercept('GET', CHECK_URL, req => {
      req.reply({ delay: 3000, body: OPEN });
    }).as('check');
    interceptRide();
    const onSuccess = cy.stub().as('success');
    mountSummon(onSuccess);

    summonFormFilled();
    tapThreeTimes(SUMMON_BUTTON);
    cy.get(SUMMON_BUTTON).should('have.attr', 'data-loading');
    cy.wait('@check');
    cy.wait('@ride');
    cy.get('@success').should('have.been.calledOnce');
    cy.get('@ride.all').should('have.length', 1);
    cy.get('@check.all').should('have.length', 1);
  });
});

describe('choosing the community shuttle for a trip', () => {
  it('asks about the time the rider picked and hides the shuttle when it is closed then', () => {
    const when = new Date(2026, 8, 15, 9, 0, 0);
    cy.intercept('GET', CHECK_URL, CLOSED).as('check');
    mountModes(when);

    cy.wait('@check')
      .its('request.url')
      .should('contain', `timestamp=${when.getTime()}`);
    cy.get('#mode-checkbox-bus').should('exist');
    cy.get('#mode-checkbox-hail').should('not.exist');
  });

  it('takes the shuttle out of the trip when saved preferences select it and it is closed', () => {
    cy.intercept('GET', CHECK_URL, CLOSED).as('check');
    const store = mountModes(new Date(2026, 8, 15, 16, 0, 0), {
      preferredModes: ['bus', 'tram', 'hail'],
    });

    cy.wait('@check');
    cy.get('#mode-checkbox-hail').should('not.exist');
    cy.wrap(null).should(() => {
      expect(store.trip.request.modes).to.include('bus');
      expect(store.trip.request.modes).not.to.include('hail');
    });
  });

  it('takes the shuttle out of a trip that already has it when it is closed', () => {
    cy.intercept('GET', CHECK_URL, CLOSED).as('check');
    const store = mountModes(new Date(2026, 8, 15, 16, 0, 0), {
      modes: ['bus', 'hail'],
    });

    cy.wait('@check');
    cy.wrap(null).should(() => {
      expect(store.trip.request.modes).to.include('bus');
      expect(store.trip.request.modes).not.to.include('hail');
    });
  });

  it('offers the shuttle when the check says it runs at that time', () => {
    cy.intercept('GET', CHECK_URL, OPEN).as('check');
    const store = mountModes(new Date(2026, 8, 15, 11, 0, 0), {
      preferredModes: ['bus', 'hail'],
    });

    cy.wait('@check');
    cy.get('#mode-checkbox-hail').should('exist');
    cy.get('[data-testid="shuttle-hours-checking"]').should('not.exist');
    cy.get('[data-testid="shuttle-hours-unconfirmed"]').should('not.exist');
    cy.wrap(null).should(() => {
      expect(store.trip.request.modes).to.include('hail');
    });
  });

  it('shows the shuttle as checking while the check is out, then plans with it and says the hours were not confirmed', () => {
    cy.intercept('GET', CHECK_URL, req => {
      req.reply({ delay: SLOW_MS, body: CLOSED });
    }).as('check');
    const store = mountModes(new Date(2026, 8, 15, 11, 0, 0), {
      preferredModes: ['bus', 'hail'],
    });

    cy.get('#mode-checkbox-hail').should('exist');
    cy.contains('Checking Community Shuttle hours...').should('be.visible');

    cy.contains("Couldn't confirm Community Shuttle hours.", {
      timeout: SLOW_MS,
    }).should('be.visible');
    cy.get('[data-testid="shuttle-hours-checking"]').should('not.exist');
    cy.get('#mode-checkbox-hail').should('exist');
    cy.wrap(null).should(() => {
      expect(store.trip.request.modes).to.include('hail');
    });
    waitOutSlowReply();
  });

  it('plans with the shuttle and says the hours were not confirmed when the check fails', () => {
    cy.intercept('GET', CHECK_URL, DOWN).as('check');
    const store = mountModes(new Date(2026, 8, 15, 11, 0, 0), {
      preferredModes: ['bus', 'hail'],
    });

    cy.wait('@check');
    cy.contains("Couldn't confirm Community Shuttle hours.").should('be.visible');
    cy.get('#mode-checkbox-hail').should('exist');
    cy.wrap(null).should(() => {
      expect(store.trip.request.modes).to.include('hail');
    });
  });

  it('keeps the plans and marks them unconfirmed when a pickup check fails', () => {
    // An arrive-by trip is judged at its plans' pickup times, so this is the
    // only place it can be told the hours were not confirmed.
    cy.intercept('GET', CHECK_URL, DOWN).as('check');
    const store = storeWithPlans([shuttleTripPlan(new Date(2026, 8, 15, 14, 40))]);
    mountResults(store);

    cy.get('[data-testid="shuttle-hours-unconfirmed-plans"]').should(
      'contain.text',
      "Couldn't confirm NFTA Community Shuttle hours."
    );
    cy.get('[data-testid="shuttle-plans-dropped"]').should('not.exist');
    cy.contains('No trips found.').should('not.exist');
  });

  it('plans with nothing but walking when the rider clears every mode', () => {
    // Clearing the last checkbox has to reach the trip. A rider who takes the
    // shuttle out of the selection and is then given shuttle plans anyway has
    // been ignored.
    cy.intercept('GET', CHECK_URL, OPEN).as('check');
    const store = mountModes(new Date(2026, 8, 15, 11, 0), { modes: ['bus', 'hail'] });

    cy.wait('@check');
    cy.get('#mode-checkbox-select-all').click({ force: true });
    cy.wrap(null).should(() => {
      expect(store.trip.request.modes).to.include('hail');
    });

    cy.get('#mode-checkbox-select-all').click({ force: true });
    cy.wrap(null).should(() => {
      expect(store.trip.request.modes.filter(mode => mode !== 'walk')).to.deep.equal(
        []
      );
    });
  });

  it('does not judge an arrive-by trip by its arrival time', () => {
    // A 2:45 PM arrival can have a pickup before the 2:30 PM close. The plans
    // are checked at their own pickup times instead.
    cy.intercept('GET', CHECK_URL, CLOSED).as('check');
    const store = mountModes(new Date(2026, 8, 15, 14, 45, 0), {
      whenAction: 'arrive',
      preferredModes: ['bus', 'hail'],
    });

    cy.get('#mode-checkbox-hail').should('exist');
    cy.get('[data-testid="shuttle-hours-checking"]').should('not.exist');
    cy.wrap(null).should(() => {
      expect(store.trip.request.modes).to.include('hail');
    });
    cy.get('@check.all').should('have.length', 0);
  });
});

describe('the trips a search comes back with', () => {
  it('says the shuttle is closed at that time instead of only "No trips found"', () => {
    // A 2:45 PM arrival planned as a 2:31 PM pickup, after the shuttle closes.
    cy.intercept('GET', CHECK_URL, CLOSED).as('check');
    const store = storeWithPlans([shuttleTripPlan(new Date(2026, 8, 15, 14, 31))]);
    mountResults(store);

    cy.get('[data-testid="shuttle-plans-dropped"]')
      .should('contain.text', "The NFTA Community Shuttle isn't running at that time.")
      .and('contain.text', 'It runs 10:30 AM - 2:30 PM that day.')
      .and(
        'contain.text',
        'Next available: Wednesday, September 16, 10:30 AM - 2:30 PM.'
      );
    cy.contains('No trips found.').should('exist');
  });

  it('says it in Spanish too', () => {
    cy.intercept('GET', CHECK_URL, CLOSED).as('check');
    const store = storeWithPlans([shuttleTripPlan(new Date(2026, 8, 15, 14, 31))], {
      language: 'es',
    });
    mountResults(store);

    cy.get('[data-testid="shuttle-plans-dropped"]')
      .should(
        'contain.text',
        'El Transporte comunitario no está en funcionamiento a esa hora.'
      )
      .and('contain.text', 'Su horario ese día es 10:30 - 14:30.')
      .and('contain.text', 'Próxima disponibilidad: miércoles');
  });

  it('says nothing about the shuttle when no plan was dropped', () => {
    cy.intercept('GET', CHECK_URL, OPEN).as('check');
    const store = storeWithPlans([shuttleTripPlan(new Date(2026, 8, 15, 11, 30))]);
    mountResults(store);

    cy.get('[data-testid="shuttle-plans-dropped"]').should('not.exist');
    cy.get('[data-testid="shuttle-hours-unconfirmed-plans"]').should('not.exist');
    cy.contains('No trips found.').should('not.exist');
  });
});
