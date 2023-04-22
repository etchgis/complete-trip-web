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
      return decoded.exp;
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
  requireMFA = false;
  refreshToken = null;
  accessToken = null; //replaces user.accessToken so that we dont keep that in the user profile and it stands alone - this should never be referenced outside this store

  /** NOTE malcolm additions */
  stagedUser = {};
  errorToastMessage = null;

  getToken = () => {
    return this.refreshToken;
  };

  clearToken = () => {
    runInAction(() => {
      this.refreshToken = null;
    });
  };

  setRequireMFA = e => {
    runInAction(() => {
      this.requireMFA = e;
    });
  };

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
            this.errorToastMessage = null;
          });
          resolve(result);
        })
        .catch(e => {
          runInAction(() => {
            this.error = e.message || e.reason;
            this.errorToastMessage = 'Unknown error sending verification code.';
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
            console.log(e);
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

  hydrate = async (profile, token) => {
    if (!profile || !token) return;
    console.log('[auth-store] hydrating profile');
    return new Promise(resolve => {
      runInAction(() => {
        // this.rootStore.profile.hydrate(profile);
        this.rootStore.preferences.hydrate(profile);
        this.rootStore.favorites.hydrate(profile);
        this.rootStore.schedule.getRange(
          moment().hour(0).valueOf(),
          moment().add(1, 'month').valueOf(),
          token
        );
        resolve();
      });
    });
  };

  removeUser = () => {
    runInAction(() => {
      this.inTransaction = true;
    });
    return new Promise(async (resolve, reject) => {
      await this.fetchAccessToken();
      authentication
        .delete(this.accessToken)
        .then(() => {
          runInAction(() => {
            this.reset();
          });
          resolve(true);
        })
        .catch(e => {
          runInAction(() => {
            this.error = e;
            this.errorToastMessage = 'Error removing user.';
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

  validateUser = async () => {
    //ONLY USE FOR LOGGED IN USERS
    if (!this.loggedIn) {
      runInAction(() => {
        this.reset();
      });
      return false;
    }

    runInAction(() => {
      this.inTransaction = true;
    });

    //IF THE REFRESH TOKEN IS EXPIRED, WE HAVE TO LOGOUT
    if (!this.user?.refreshToken || !validateJWT(this.user.refreshToken)) {
      runInAction(() => {
        this.reset();
        this.errorToastMessage = 'Session expired, please login.';
      });
      return false;
    }

    //THE MAIN POINT FOR THIS FN IS TO CHECK THE ACCESS TOKEN FOR THE SESSION - AND THEN PROCEEED
    //THIS IS FOR MAKING DATABASE UPDATES WHILE THE USER IS LOGGED IN - WE DONT WANT TO REFRESH THE TOKEN IN THESE INSTANCES AS IT CAUSES A CASCADE EFFECT WHICH WE WANT TO AVOID
    if (validateJWT(this.accessToken)) {
      //THIS WILL VERIFY THE USER EXISTS
      const valid = await authentication.refreshUser(this.accessToken);
      //IF THIS IS INVALID IT MEANS THE USER NO LONGER EXISTS
      if (!valid) {
        runInAction(() => {
          this.reset();
          this.errorToastMessage = 'Session expired, please login.';
        });
        return false;
      }
      runInAction(() => {
        this.inTransaction = false;
      });
      return true;
    } else {
      //THIS WILL REFRESH THE ACCESS TOKEN
      //TODO edge case where the user has kept the browser open for 24hours then tries to make updates to the profile...
      const valid = await authentication
        .refreshAccessToken()
        .then(res => res.json())
        .catch(e => {
          return false;
        });
      //NOTE if this fails it's something to do with the database, very edge case
      if (!valid) {
        runInAction(() => {
          this.reset();
          this.errorToastMessage =
            'An error occurred refreshing the session. Login and try again.';
        });
        return false;
      }
      runInAction(() => {
        this.inTransaction = false;
        this.accessToken = valid.accessToken;
      });
      return true;
    }
  };

  /**
   * Get the user's access token, renewing if necessary.
   * Several modules might call this in parallel, but it won't do a separate query for
   * each one.
   * @returns {Promise} - the user access token.
   */
  fetchAccessToken = skipHydrate => {
    console.log('[auth-store] fetchAccessToken auth flow');

    runInAction(() => {
      this.inTransaction = true;
      this.loggingIn = true;
    });

    if (this.accessTokenPromise) {
      return this.accessTokenPromise;
    }

    if (!this.user?.refreshToken) {
      runInAction(() => {
        this.reset();
      });
      return Promise.reject(new Error('not logged in'));
    }

    // if invalid - logout, reset store
    if (!validateJWT(this.user.refreshToken)) {
      console.log('[auth-store] invalid refresh token');
      this.reset();
      this.errorToastMessage('Session expired, please login.');
    }

    //NOTE this will refresh the user on each page load
    if (validateJWT(this.accessToken)) {
      console.log('[auth-store] valid access token found');

      const accessToken = this.accessToken;
      return new Promise((resolve, reject) => {
        authentication
          .refreshUser(accessToken)
          .then(result => {
            runInAction(async () => {
              this.loggedIn = true;
              this.loggingIn = false;
              this.requireMFA = false;
              this.inTransaction = false;
              if (!skipHydrate) {
                this.user = result;
                await this.hydrate(result?.profile, accessToken);
              } else {
                console.log('[auth-store] skipping hydration of user profile');
              }
            });

            resolve(result);
          })
          .catch(e => {
            console.log(e);
            runInAction(() => {
              this.reset();
              this.errorToastMessage = 'An unknown error occurred.';
            });
            reject(e);
          });
      });
    } else {
      //NOTE this will refresh the access token if it is missing or invalid/expired
      this.accessTokenPromise = authentication
        .refreshAccessToken(this.user.refreshToken)
        .then(result => {
          this.accessTokenPromise = null;
          if (result.accessToken) {
            console.log('[auth-store] received access token');
            runInAction(() => {
              this.accessToken = result.accessToken;
              this.accessTokenPromise = null;
              this.fetchAccessToken(); //NOTE this runs through this function again to hydrate the user
            });
            return result.accessToken;
          }
          throw new Error('user access failed');
        });
    }

    return this.accessTokenPromise;
  };

  /**
   *
   * @param {*} email
   * @param {*} password
   * @param {Boolean} skipMFA //true false - if true ignore MFA modal
   * @returns
   */
  login = (email, password, skipMFA) => {
    console.log('[auth-store] logging in');
    runInAction(() => {
      this.loggingIn = true;
      this.inTransaction = true;
    });
    return new Promise((resolve, reject) => {
      authentication
        .login(email, password)
        .then(async result => {
          runInAction(() => {
            if (result?.profile?.onboarded && !skipMFA) {
              this.user = {
                email: result?.email,
                phone: result?.phone,
                locked: result?.locked,
              };
              this.refreshToken = result.refreshToken;
              console.log({ result });
              this.requireMFA = true;
            } else {
              this.user = result;
              this.loggedIn = true;
              this.hydrate(result?.profile, result.accessToken);
            }
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
    console.log('[auth-store] reset');
    runInAction(() => {
      // this.rootStore.mapManager.hide();
      // this.rootStore.profile.reset();

      this.user = {};
      this.error = null;
      this.loggedIn = false;
      this.loggingIn = false;
      this.registering = false;
      this.rootStore.favorites.reset();
      this.rootStore.schedule.reset();
      this.rootStore.preferences.reset();
      this.inTransaction = false;
      this.refreshToken = null;
      this.requireMFA = false;
      this.stagedUser = {};
      this.errorToastMessage = null;
      this.accessToken = null;
    });
  };

  updateUser = user => {
    return new Promise(resolve => {
      runInAction(() => {
        this.user = user;
        resolve();
      });
    });
  };

  updateUserProfile = profile => {
    console.log('[auth-store] updateUserProfile');
    runInAction(() => {
      this.inTransaction = true;
    });
    return new Promise(async resolve => {
      //NOTE skip hydrate since we are already hydrating in this function
      const skipHydrate = true;
      await this.fetchAccessToken(skipHydrate);
      // const valid = await this.validateUser();
      // if (!valid) resolve({ error: 'invalid user' });
      // console.log({ valid });
      authentication
        .update({ profile }, this.accessToken)
        .then(result => {
          runInAction(() => {
            this.user.profile = result?.profile;
            console.log({ result });
            this.rootStore.preferences.hydrate(result?.profile); //needed for the trip store
            // this.accessToken = null; //DEBUG
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
        .updatePassword(oldPassword, password, this.accessToken)
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
        .updatePhone(phone, this.accessToken)
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
