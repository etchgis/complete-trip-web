import { PersistStoreMap, makePersistable } from 'mobx-persist-store';
import { makeAutoObservable, runInAction } from 'mobx';

import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config';
import moment from 'moment';
import trips from '../services/transport/trips';

class Schedule {
  trips = [];
  selectedTrip = null;
  error = null;

  constructor(rootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;

    if (
      !Array.from(PersistStoreMap.values())
        .map(item => item.storageName)
        .includes('Schedule')
    ) {
      makePersistable(this, {
        name: 'Schedule',
        properties: ['trips'],
        storage: process.env.WEB ? localStorage : AsyncStorage,
      });
    }
  }

  selectTrip = trip => {
    runInAction(() => {
      this.selectedTrip = trip;
    });
  };

  add = (plan, request, accessToken) => {
    const token =
      accessToken || this.rootStore.authentication.user?.accessToken;
    const userId = this.rootStore.authentication.user?.id;
    const organizationId = config.ORGANIZATION;
    const datetime = moment(request.whenTime).valueOf();
    const origin = {
      address: request?.origin?.description || '',
      coordinates: [
        request?.origin?.point?.lng || 0,
        request?.origin?.point?.lat || 0,
      ],
    };
    const destination = {
      address: request?.destination?.description || '',
      coordinates: [
        request?.destination?.point?.lng || 0,
        request?.destination?.point?.lat || 0,
      ],
    };
    let tripPlan = { ...plan };
    tripPlan.request = request;
    console.log({ tripPlan });
    runInAction(() => {
      this.rootStore.authentication.inTransaction = true;
    });

    return new Promise(async (resolve, reject) => {
      trips
        .add(
          userId,
          organizationId,
          datetime,
          origin,
          destination,
          tripPlan,
          token
        )
        .then(result => {
          runInAction(() => {
            this.error = null;
            this.trips.push(result);
          });
          resolve(result);
        })
        .catch(e => {
          runInAction(() => {
            this.error = e;
          });
          reject(e);
        })
        .finally(() => {
          runInAction(() => {
            this.rootStore.authentication.inTransaction = false;
          });
        });
    });
  };

  cancel = (tripId, accessToken) => {
    return new Promise(async (resolve, reject) => {
      trips
        .delete(tripId, accessToken)
        .then(() => {
          runInAction(() => {
            this.error = null;
            var i = this.trips.findIndex(t => t.id === tripId);
            if (i > -1) {
              this.trips.splice(i, 1);
            }
          });
          resolve(true);
        })
        .catch(e => {
          runInAction(() => {
            this.error = e;
          });
          reject(e);
        });
    });
  };

  get = (datetime, accessToken) => {
    runInAction(() => {
      this.rootStore.authentication.inTransaction = true;
    });
    return new Promise(async (resolve, reject) => {
      trips
        .get(datetime, accessToken)
        .then(result => {
          runInAction(() => {
            this.error = null;
            this.trips = result?.member || [];
          });
          resolve(this.trips);
        })
        .catch(e => {
          runInAction(() => {
            this.error = e;
          });
          reject(e);
        })
        .finally(() => {
          runInAction(() => {
            this.rootStore.authentication.inTransaction = false;
          });
        });
    });
  };

  getRange = (from, to, accessToken) => {
    return new Promise(async (resolve, reject) => {
      trips
        .getRange(from, to, accessToken)
        .then(result => {
          runInAction(() => {
            this.error = null;
            this.trips = result?.member || [];
          });
          resolve(this.trips);
        })
        .catch(e => {
          runInAction(() => {
            this.error = e;
          });
          reject(e);
        });
    });
  };

  updateTripRequest = (id, request, accessToken) => {
    return new Promise(async (resolve, reject) => {
      let i = this.trips.findIndex(t => t.id === id);
      if (i > -1) {
        runInAction(() => {
          this.rootStore.authentication.inTransaction = true;
        });
        const trip = this.trips[i];
        let plan = { ...trip.plan };
        plan.request = request;
        trips.update
          .plan(trip.id, plan, accessToken)
          .then(result => {
            runInAction(() => {
              this.trips[i] = result;
            });
            resolve(result);
          })
          .catch(e => {
            runInAction(() => {
              this.error = e;
            });
            reject(e);
          })
          .finally(() => {
            runInAction(() => {
              this.rootStore.authentication.inTransaction = false;
            });
          });
      } else {
        reject(false);
      }
    });
  };

  reset = () => {
    runInAction(() => {
      this.trips = [];
      this.selectedTrip = null;
      this.error = null;
    });
  };
}

export default Schedule;
