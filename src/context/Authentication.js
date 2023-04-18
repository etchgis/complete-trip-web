// import AsyncStorage from '@react-native-async-storage/async-storage';

import { PersistStoreMap, makePersistable } from 'mobx-persist-store';
import { makeAutoObservable, runInAction } from 'mobx';

import { authentication } from '../services/transport';
import config from '../config';
import jwtDecode from 'jwt-decode';
import moment from 'moment';

const validateJWT = token => {
  try {
    const decoded = jwtDecode(token);
    if (decoded.exp > Date.now() / 1000) {
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
};

class Authentication {
  user = {};
  loggedIn = false;
  loggingIn = false;
  registering = false;
  error = null;
  inTransaction = false;

  /** NOTE malcolm additions */
  stagedUser = {};
  errorToastMessage = null;

  setInTransaction = e => {
    runInAction(() => {
      this.inTransaction = e;
    });
  };

  setStagedUser = user => {
    runInAction(() => {
      this.stagedUser = user;
    });
  };

  setError = error => {
    runInAction(() => {
      this.error = error;
    });
  };

  setErrorToastMessage = message => {
    runInAction(() => {
      this.errorToastMessage = message;
    });
  };

  registerUser = user => {
    runInAction(() => {
      this.inTransaction = true;
    });
    return new Promise((resolve, reject) => {
      if (!user.email || !user.firstName || !user.lastName || !user.password) {
        this.error = 'Missing required fields.';
        this.errorToastMessage = 'Missing required fields.';
        this.inTransaction = false;
        reject({ error: true, message: 'Please fill out all fields' });
      }

      const profile = {
        firstName: user.firstName,
        lastName: user.lastName,
        mfa: false,
        onboarded: false,
      };
      console.log({ user });
      console.log({ profile });
      authentication
        .register(
          user.email,
          '+15555555555',
          config.ORGANIZATION,
          user.password,
          profile
        )
        .then(result => {
          runInAction(() => {
            this.error = null;
            this.inTransaction = false;
            resolve(result);
          });
        })
        .catch(e => {
          runInAction(() => {
            this.error = e.message || e.reason;
            this.errorToastMessage = e.message || e.reason;
            this.inTransaction = false;
            reject(e);
          });
        });
    });
  };

  verifyUser = (channel, to) => {
    runInAction(() => {
      this.inTransaction = true;
    });
    return new Promise((resolve, reject) => {
      authentication
        .verify(channel, to)
        .then(result => {
          runInAction(() => {
            this.error = null;
          });
          resolve(result);
        })
        .catch(e => {
          runInAction(() => {
            this.error = e.message || e.reason;
            console.log(e);
          });
          reject(e);
        })
        .finally(() => {
          runInAction(() => {
            this.inTransaction = false;
          });
        });
    });
  };

  confirmUser = (to, code) => {
    runInAction(() => {
      this.registering = true;
      this.inTransaction = true;
    });
    return new Promise((resolve, reject) => {
      authentication
        .confirm(config.VERIFY.SID, to, code)
        .then(result => {
          console.log('result', result);
          if (!result || !result.valid) throw new Error('Invalid code.');
          runInAction(() => {
            this.error = null;
            this.registering = false;
          });
          resolve(result);
        })
        .catch(e => {
          runInAction(() => {
            this.error = e;
            this.errorToastMessage = 'Possible invalid code.';
            this.registering = false;
          });
          reject(e);
        })
        .finally(() => {
          runInAction(() => {
            this.inTransaction = false;
          });
        });
    });
  };

  hydrate = (profile, token) => {
    if (!profile || !token) return;
    console.log('[auth-store] hydrating profile...');
    runInAction(() => {
      this.rootStore.profile.hydrate(profile);
      this.rootStore.preferences.hydrate(profile);
      this.rootStore.favorites.hydrate(profile);
      this.rootStore.schedule.getRange(
        moment().hour(0).valueOf(),
        moment().add(1, 'month').valueOf(),
        token
      );
    });
  };

  /************************* */

  accessTokenPromise = null;

  constructor(rootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;

    if (
      !Array.from(PersistStoreMap.values())
        .map(item => item.storageName)
        .includes('Display')
    ) {
      makePersistable(this, {
        name: 'Authentication',
        properties: ['user'],
        storage: localStorage,
      });
    }
  }

  clearError = () => {
    runInAction(() => {
      this.error = null;
    });
  };

  /**
   * Get the user's access token, renewing if necessary.
   * Several modules might call this in parallel, but it won't do a separate query for
   * each one.
   * @returns {Promise} - the user access token.
   */
  fetchAccessToken = () => {
    runInAction(() => {
      this.inTransaction = true;
      this.loggingIn = true;
    });
    if (this.accessTokenPromise) {
      return this.accessTokenPromise;
    }
    if (!this.user?.refreshToken) {
      runInAction(() => {
        this.loggingIn = false;
        this.inTransaction = false;
      });
      return Promise.reject(new Error('not logged in'));
    }

    // if invalid - logout, reset store
    if (!validateJWT(this.user.refreshToken)) {
      this.logout();
    }

    //NOTE this will refresh the user on each page load
    if (validateJWT(this.user.accessToken)) {
      console.log('[auth-store] valid access token found');
      const accessToken = this.user.accessToken;
      return new Promise((resolve, reject) => {
        authentication
          .refreshUser(accessToken)
          .then(result => {
            runInAction(() => {
              this.loggedIn = true;
              this.user = Object.assign({}, result, {
                accessToken: accessToken,
              });
              this.hydrate(result?.profile, accessToken);
            });
            resolve(result);
          })
          .catch(e => {
            runInAction(() => {
              this.error = e.message || e.reason || 'An error occurred.';
              this.errorToastMessage = 'An error occurred. Please try again.';
              this.loggedIn = false;
            });
            reject(e);
          })
          .finally(() => {
            runInAction(() => {
              this.inTransaction = false;
              this.loggingIn = false;
            });
          });
      });
    } else {
      this.accessTokenPromise = authentication
        .refreshAccessToken(this.user.refreshToken)
        .then(result => {
          this.accessTokenPromise = null;
          if (result.accessToken) {
            console.log('[auth-store] refreshed access token');
            runInAction(() => {
              this.user.accessToken = result.accessToken;
              this.user.__test = true; //NOTE remove once the token api is done
              this.fetchAccessToken();
            });
            return result.accessToken;
          }
          throw new Error('user access failed');
        });
    }

    //NOTE move this somehwere else - generally clean up this whole function
    runInAction(() => {
      this.inTransaction = false;
      this.loggingIn = false;
    });

    return this.accessTokenPromise;
  };

  login = (email, password) => {
    runInAction(() => {
      this.loggingIn = true;
      this.inTransaction = true;
    });
    return new Promise((resolve, reject) => {
      authentication
        .login(email, password)
        .then(async result => {
          runInAction(() => {
            this.loggedIn = true;
            this.user = result;
            this.hydrate(result?.profile);
            this.error = null;
          });
          resolve(true);
        })
        .catch(e => {
          runInAction(() => {
            this.error = 'Incorrect email or password';
          });
          reject(e);
        })
        .finally(() => {
          runInAction(() => {
            this.loggingIn = false;
            this.inTransaction = false;
          });
        });
    });
  };

  logout = () => {
    this.reset();
  };

  setLoggedIn = loggedIn => {
    runInAction(() => {
      this.loggedIn = loggedIn;
      this.loggingIn = false;
    });
    if (!loggedIn) {
      this.reset();
    }
  };

  reset = () => {
    runInAction(() => {
      // this.rootStore.mapManager.hide();
      this.user = {};
      this.error = null;
      this.loggingIn = false;
      this.loggedIn = false;
      this.registering = false;
      this.rootStore.profile.reset();
      this.rootStore.preferences.reset();
      this.rootStore.favorites.reset();
      this.rootStore.schedule.reset();
      this.inTransaction = false;
    });
  };

  updateUser = user => {
    runInAction(() => {
      this.user = user;
    });
  };

  updateUserProfile = profile => {
    runInAction(() => {
      this.inTransaction = true;
    });
    return new Promise(resolve => {
      authentication
        .update({ profile }, this.user.accessToken)
        .then(result => {
          console.log('got result, step 1');
          runInAction(() => {
            this.user.profile = result?.profile;
          });
          resolve(profile);
        })
        .catch(e => {
          console.log(e);
          runInAction(() => {
            this.errorToastMessage = 'Error updating profile';
          });
          resolve({ error: e });
        })
        .finally(() => {
          runInAction(() => {
            this.inTransaction = false;
          });
        });
    });
  };

  updateUserPassword = (oldPassword, password) => {
    runInAction(() => {
      this.inTransaction = true;
    });
    return new Promise(async (resolve, reject) => {
      await this.fetchAccessToken();
      authentication
        .updatePassword(oldPassword, password, this.user.accessToken)
        .then(() => {
          runInAction(() => {
            this.error = null;
          });
          resolve(true);
        })
        .catch(e => {
          runInAction(() => {
            this.error = e;
            this.errorToastMessage =
              'Error updating password - did you enter the correct old password?';
          });
          reject(e);
        })
        .finally(() => {
          runInAction(() => {
            this.inTransaction = false;
          });
        });
    });
  };

  updateUserPhone = phone => {
    runInAction(() => {
      this.inTransaction = true;
    });
    return new Promise(async (resolve, reject) => {
      await this.fetchAccessToken();
      authentication
        .updatePhone(phone, this.user.accessToken)
        .then(() => {
          runInAction(() => {
            this.error = null;
            this.user.phone = phone;
          });
          resolve(true);
        })
        .catch(e => {
          runInAction(() => {
            this.error = e;
            this.errorToastMessage = 'Error updating phone number';
          });
          reject(e);
        })
        .finally(() => {
          runInAction(() => {
            this.inTransaction = false;
          });
        });
    });
  };
}

export default Authentication;
