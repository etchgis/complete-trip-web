import { makeAutoObservable, runInAction } from 'mobx';

import { decryptCode } from '../utils/decryptCode';
import travelerAPI from '../services/transport/traveler';

class Caregivers {
  code = null;
  caregivers = [];
  dependents = [];
  stagedCaregiver = {
    firstName: null,
    lastName: null,
    email: null,
  };

  constructor(rootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  reset = () => {
    runInAction(() => {
      this.code = null;
      this.caregivers = [];
      this.dependents = [];
      this.stagedCaregiver = {
        firstName: null,
        lastName: null,
        email: null,
      };
    });
  };

  setCode = value => {
    runInAction(() => {
      this.code = value ? decryptCode(value) : null;
    });
  };

  setStagedCaregiver = update => {
    runInAction(() => {
      this.stagedCaregiver = { ...this.stagedCaregiver, ...update };
    });
  };

  hydrate = () => {
    console.log('{caregivers store} hydrate');
    return new Promise(async (resolve, reject) => {
      const token = await this.rootStore.authentication.fetchToken();
      const caregivers = await travelerAPI.caregivers.get.all(token);
      const dependents = await travelerAPI.dependents.get.all(token);
      if (!caregivers?.member || !dependents?.member)
        reject({
          message: 'An unknown error occurred.',
        });

      const validCaregivers = caregivers?.member?.filter(c => {
        return (
          c.status === 'pending' ||
          c.status === 'received' ||
          c.status === 'approved' || 
          c.status === 'denied'
        );
      });
      const validDependents = dependents?.member?.filter(d => {
        return d.status === 'approved' || d.status === 'received';
      });
      runInAction(() => {
        this.caregivers = validCaregivers;
        this.dependents = validDependents;
      });
      resolve(true);
    });
  };
  //TODO change this when API changes
  invite = (email, firstName, lastName) => {
    return new Promise(async (resolve, reject) => {
      const token = await this.rootStore.authentication.fetchToken();
      runInAction(() => {
        this.rootStore.authentication.inTransaction = true;
      });
      travelerAPI.caregivers
        .invite(
          email.toLowerCase().trim(),
          firstName.trim(),
          lastName.trim(),
          token
        )
        .then(response => {
          resolve(response); //TODO show success message? maybe inside the component
        })
        .catch(err => {
          console.log('err', err); //TODO show error message
          reject(err);
        })
        .finally(() => {
          runInAction(() => {
            this.rootStore.authentication.inTransaction = false;
          });
        });
    });
  };

  /**
   *
   * @param {String} id
   * @param {('pending'|'received'|'approved'|'denied') } status
   * @returns
   */
  update = (id, status) => {
    return new Promise(async (resolve, reject) => {
      const token = await this.rootStore.authentication.fetchToken();
      const userId = this.rootStore.authentication.user?.id;
      runInAction(() => {
        this.rootStore.authentication.inTransaction = true;
      });
      travelerAPI.dependents.update
        .status(id, userId, status, token)
        .then(async response => {
          await this.hydrate();
          resolve(response);
        })
        .catch(err => {
          console.log('err', err);
          reject(err);
        })
        .finally(() => {
          runInAction(() => {
            this.rootStore.authentication.inTransaction = false;
          });
        });
    });
  };

  removeCaregiver = id => {
    return new Promise(async (resolve, reject) => {
      const token = await this.rootStore.authentication.fetchToken();
      runInAction(() => {
        this.rootStore.authentication.inTransaction = true;
      });
      travelerAPI.caregivers
        .delete(id, token)
        .then(async response => {
          await this.hydrate();
          resolve(response);
        })
        .catch(err => {
          reject(err);
        })
        .finally(() => {
          runInAction(() => {
            this.rootStore.authentication.inTransaction = false;
          });
        });
    });
  };

  removeDependent = id => {
    return new Promise(async (resolve, reject) => {
      const token = await this.rootStore.authentication.fetchToken();
      runInAction(() => {
        this.rootStore.authentication.inTransaction = true;
      });
      travelerAPI.dependents
        .delete(id, token)
        .then(async response => {
          await this.hydrate();
          resolve(response);
        })
        .catch(err => {
          reject(err);
        })
        .finally(() => {
          runInAction(() => {
            this.rootStore.authentication.inTransaction = false;
          });
        });
    });
  };
}

export default Caregivers;
