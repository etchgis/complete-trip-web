// import { PersistStoreMap, makePersistable } from 'mobx-persist-store';

import { makeAutoObservable, runInAction } from 'mobx';

import config from '../config';
import { isEqual } from 'lodash';
import moment from 'moment';
import trips from '../services/transport/trips';

// import AsyncStorage from '@react-native-async-storage/async-storage';

class Schedule {
  trips = [];
  dependentTrips = [];
  selectedTrip = null;
  error = null;

  constructor(rootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;

    // if (
    //   !Array.from(PersistStoreMap.values())
    //     .map(item => item.storageName)
    //     .includes('Schedule')
    // ) {
    //   makePersistable(this, {
    //     name: 'Schedule',
    //     properties: ['trips'],
    //     storage: localStorage,
    //   });
    // }
  }

  hydrate = async () => {
    return await this.getRange(
      moment().hour(0).valueOf(),
      moment().add(1, 'month').valueOf()
    );
  };

  hydrateDependentTrips = async () => {
    const dependents = this.rootStore.caregivers.dependents.filter(
      d => d.status === 'approved'
    );
    if (this?.rootStore?.uiStore?.debug)
      console.log('{schedule-store}', dependents);
    if (!dependents.length) {
      runInAction(() => {
        this.dependentTrips = [];
      });
      return Promise.resolve();
    }
    try {
      const _trips = [];
      await Promise.all(
        dependents.map(async d => {
          const trips = await this.getDependentSchedule(
            d.dependent,
            // moment().subtract(2, 'months').valueOf(),
            // moment().add(1, 'month').valueOf()
            moment().hour(0).valueOf(),
            moment().add(10, 'days').valueOf()
          );
          runInAction(() => {
            _trips.push(
              ...trips.map(trip => ({
                ...trip,
                dependent: d,
                origin: trip?.plan?.request?.origin?.title,
                destination: trip?.plan?.request?.destination?.title,
              }))
            );
          });
        })
      );
      const equals = isEqual(_trips, this.dependentTrips);
      if (this?.rootStore?.uiStore?.debug)
        console.log('{schedule-store} dependent trips have changed', !equals);
      runInAction(() => {
        if (!equals) this.dependentTrips = _trips;
      });
    } catch (error) {
      console.error('Error hydrating dependent trips:', error);
    }
  };

  selectTrip = trip => {
    runInAction(() => {
      this.selectedTrip = trip;
    });
  };

  add = (plan, request) => {
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

    return new Promise(async (resolve, reject) => {
      const token = await this.rootStore.authentication.fetchToken();

      runInAction(() => {
        this.rootStore.authentication.inTransaction = true;
      });
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

  cancel = tripId => {
    return new Promise(async (resolve, reject) => {
      //NOTE skip hydration as it hydrates *after* the call to cancel so that it returns the same trip again
      const token = await this.rootStore.authentication.fetchToken();
      runInAction(() => {
        this.rootStore.authentication.inTransaction = true;
      });
      console.log('cancel trip', tripId);
      trips
        .delete(tripId, token)
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
        })
        .finally(() => {
          runInAction(() => {
            this.rootStore.authentication.inTransaction = false;
          });
        });
    });
  };

  get = datetime => {
    return new Promise(async (resolve, reject) => {
      const token = await this.rootStore.authentication.fetchToken();
      runInAction(() => {
        this.rootStore.authentication.inTransaction = true;
      });
      trips
        .get(datetime, token)
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

  getRange = (from, to) => {
    return new Promise(async (resolve, reject) => {
      const token = await this.rootStore.authentication.fetchToken();
      runInAction(() => {
        this.rootStore.authentication.inTransaction = true;
      });
      trips
        .getRange(from, to, token)
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

  getDependentSchedule(dependentId, from, to) {
    return new Promise(async (resolve, reject) => {
      const token = await this.rootStore.authentication.fetchToken();
      trips
        .getDependentsRange(dependentId, from, to, token)
        .then(result => {
          this.error = null;
          const dependentTrips = result?.member || [];
          if (dependentTrips.length > 0) {
            dependentTrips.sort(
              (a, b) => a.plan?.startTime - b.plan?.startTime
            );
          }
          resolve(dependentTrips);
        })
        .catch(e => {
          runInAction(() => {
            this.error = e;
          });
          reject(e);
        });
    });
  }

  updateTripRequest = (id, request) => {
    return new Promise(async (resolve, reject) => {
      const token = await this.rootStore.authentication.fetchToken();

      runInAction(() => {
        this.rootStore.authentication.inTransaction = true;
      });
      let i = this.trips.findIndex(t => t.id === id);
      if (i > -1) {
        const trip = this.trips[i];
        let plan = { ...trip.plan };
        plan.request = request;
        trips.update
          .plan(trip.id, plan, token)
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
