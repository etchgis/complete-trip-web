import { makeAutoObservable, runInAction } from 'mobx';

import { decryptCode } from '../utils/decryptCode';
import travelerAPI from '../services/transport/traveler';

class Caregivers {
  //FOR EMAIL LINK CAREGIVER INVITE
  inviteCode = null;
  stagedDependent = {
    firstName: null,
    lastName: null,
  };
  //

  caregivers = [];
  dependents = [];
  denied = [];

  //FOR REGISTERING A NEW CAREGIVER UPON SIGNUP
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
      this.inviteCode = null;
      this.stagedDependent = clearJSON(this.stagedDependent);
      this.caregivers = [];
      this.dependents = [];
      this.stagedCaregiver = {
        firstName: null,
        lastName: null,
        email: null,
      };
    });
  };

  setInviteCode = value => {
    try {
      const decrypted = decryptCode(value);
      console.log('{caregivers-store}', decrypted);
      if (!decrypted || !decrypted.caregiver)
        throw new Error('invalid invite code');
      runInAction(() => {
        this.inviteCode = decrypted?.caregiver;
        this.stagedDependent = {
          firstName: decrypted?.dependentFirstName,
          lastName: decrypted?.dependentLastName,
        };
      });
    } catch (error) {
      console.log('{caregivers-store} error', error);
      runInAction(() => {
        this.inviteCode = null;
        this.stagedDependent = clearJSON(this.stagedDependent);
      });
    }
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
      // console.log('{caregivers-store} de', dependents);
      if (!caregivers?.member || !dependents?.member)
        reject({
          message: 'An unknown error occurred.',
        });

      const validCaregivers = caregivers?.member?.filter(c => {
        return (
          c.status === 'pending' ||
          c.status === 'received' ||
          c.status === 'approved'
        );
      });
      const deniedCaregivers = caregivers?.member?.filter(c => {
        return c.status === 'denied';
      });
      const validDependents = dependents?.member?.filter(d => {
        return d.status === 'approved' || d.status === 'received';
      });
      runInAction(() => {
        this.caregivers = validCaregivers;
        this.dependents = validDependents;
        this.denied = deniedCaregivers;
      });
      resolve(true);
    });
  };

  invite = (email, firstName, lastName) => {
    return new Promise(async (resolve, reject) => {
      runInAction(() => {
        this.rootStore.authentication.inTransaction = true;
      });
      //CHECK IF THE CAREGIVER WAS PREVIOULSY DENIED
      let deniedId = null;
      this.denied.forEach(c => {
        if (c.email === email.toLowerCase().trim()) deniedId = c.id;
      });
      console.log('wasDenied', deniedId);
      const token = await this.rootStore.authentication.fetchToken();
      try {
        const invited = deniedId
          ? await travelerAPI.caregivers.reinvite(deniedId, token)
          : await travelerAPI.caregivers.invite(
              email.toLowerCase().trim(),
              firstName.trim(),
              lastName.trim(),
              token
            );
        resolve(invited);
        runInAction(() => {
          this.rootStore.authentication.inTransaction = false;
        });
      } catch (error) {
        console.log('error', error);
        runInAction(() => {
          this.rootStore.authentication.inTransaction = false;
        });
        reject(error);
      }
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

function clearJSON(obj) {
  for (let key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      setAllValuesToNull(obj[key]);
    } else {
      obj = { ...obj, [key]: null };
    }
  }
}
