import { makeAutoObservable, runInAction } from 'mobx';

import TripPlan from '../models/trip-plan';
import TripRequest from '../models/trip-request';
import { screenShuttlePickups } from '../hooks/useServiceAvailability';

// import { makePersistable, PersistStoreMap } from 'mobx-persist-store';

class Trip {
  request = new TripRequest();
  plans = [];
  selectedPlan = null;

  // What the shuttle availability checks did to the plans of the last search:
  // the pickup that was dropped as closed, if any, and the services whose
  // checks could not be read. The results screen says both.
  shuttleNotice = null;

  generatingPlans = false;
  queryId = -1;

  isShuttle = false;

  constructor(rootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  create() {
    this.reset();
  }

  updateOrigin(origin) {
    runInAction(() => {
      this.request.updateProperty('origin', origin);
    });
  }

  updateDestination(destination) {
    runInAction(() => {
      this.request.updateProperty('destination', destination);
    });
  }

  updateWhenAction(whenAction) {
    runInAction(() => {
      this.request.updateProperty('whenAction', whenAction);
    });
  }

  updateWhen(when) {
    runInAction(() => {
      this.request.updateProperty('whenTime', when);
    });
  }

  addMode(mode) {
    runInAction(() => {
      this.request.addMode(mode);
    });
  }

  removeMode(mode) {
    runInAction(() => {
      this.request.removeMode(mode);
    });
  }

  updateProperty(property, value) {
    runInAction(() => {
      this.request.updateProperty(property, value);
    });
  }

  toggleShuttle(isShuttle) {
    runInAction(() => {
      this.isShuttle = isShuttle;
    });
  }

  generatePlans() {
    const queryId = Date.now();
    runInAction(() => {
      this.generatingPlans = true;
      this.queryId = queryId;
      this.shuttleNotice = null;
    });
    console.log('TRIP GENERATE PLANS');
    return new Promise((resolve, reject) => {
      TripPlan.generate(this.request, this.rootStore.preferences, queryId)
        .then(async tripPlanResults => {
          console.log({ tripPlanResults });
          if (this.queryId !== tripPlanResults.id) return;
          const screened = await screenShuttlePickups(tripPlanResults.plans);
          if (this.queryId === tripPlanResults.id) {
            runInAction(() => {
              this.plans = screened.plans;
              this.shuttleNotice = {
                closed: screened.closed,
                unconfirmed: screened.unconfirmed,
              };
              this.generatingPlans = false;
            });
            resolve(this.plans);
          }
        })
        .catch(e => {
          reject(e);
        })
        .finally(() => {
          // A newer search is already running, and the screen belongs to it, so
          // an older one finishing must not stop its spinner.
          if (this.queryId !== queryId) return;
          runInAction(() => {
            this.generatingPlans = false;
          });
        });
    });
  }

  reset() {
    runInAction(() => {
      this.request = new TripRequest();
      this.plans = [];
      this.shuttleNotice = null;
      this.selected = false;
      this.isShuttle = false;
    });
  }
}

export default Trip;
