import { makeAutoObservable, runInAction } from 'mobx';

import TripPlan from '../models/trip-plan';
import TripRequest from '../models/trip-request';

// import { makePersistable, PersistStoreMap } from 'mobx-persist-store';

class Trip {
  request = new TripRequest();
  plans = [];
  selectedPlan = null;

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
    runInAction(() => {
      this.generatingPlans = true;
      this.queryId = Date.now();
    });
    console.log('TRIP GENERATE PLANS');
    return new Promise((resolve, reject) => {
      TripPlan.generate(this.request, this.rootStore.preferences, this.queryId)
        .then(tripPlanResults => {
          console.log({ tripPlanResults });
          if (this.queryId === tripPlanResults.id) {
            runInAction(() => {
              this.plans = tripPlanResults.plans;
              this.generatingPlans = false;
            });
            resolve(this.plans);
          }
        })
        .catch(e => {
          reject(e);
        })
        .finally(() => {
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
      this.selected = false;
      this.isShuttle = false;
    });
  }
}

export default Trip;
