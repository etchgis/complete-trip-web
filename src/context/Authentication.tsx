// import AsyncStorage from '@react-native-async-storage/async-storage';

import { PersistStoreMap, makePersistable } from 'mobx-persist-store';
import { makeAutoObservable, runInAction } from 'mobx';

import { authentication } from '../services/transport';
import config from '../config';
import jwtDecode from 'jwt-decode';
import { User, Profile } from '../types/UserProfile';

interface JWTPayload {
  exp: number;
}

const validateJWT = (token: string): number | false => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    if (decoded.exp > Date.now() / 1000) {
      return decoded.exp;
    }
    return false;
  } catch (err) {
    return false;
  }
};

class Authentication {
  user: Partial<User> = {};
  contact: { email?: string; phone?: string } = {};
  loggedIn = false;
  loggingIn = false;
  registering = false;
  error: string | null = null;
  inTransaction = false;
  requireMFA = false;
  refreshToken: string | null = null;
  accessToken: string | null = null; //replaces user.accessToken so that we dont keep that in the user profile and it stands alone - this should never be referenced outside this store
  stagedUser: Partial<User> = {};
  errorToastMessage: string | null = null;
  accessTokenPromise: Promise<string> | null = null;
  rootStore: any;

  constructor(rootStore: any) {
    makeAutoObservable(this);
    this.rootStore = rootStore;

    if (
      !Array.from(PersistStoreMap.values())
        .map(item => item.storageName)
        .includes(`Authentication`)
    ) {
      makePersistable(this, {
        name: `Authentication`,
        properties: ['user', 'refreshToken'],
        storage: localStorage,
      });
    }
  }

  setRequireMFA = (e: boolean) => {
    runInAction(() => {
      this.requireMFA = e;
    });
  };

  setInTransaction = (e: boolean) => {
    runInAction(() => {
      this.inTransaction = e;
    });
  };

  setStagedUser = (user: Partial<User>) => {
    runInAction(() => {
      this.stagedUser = user;
    });
  };

  setError = (error: string | null) => {
    runInAction(() => {
      this.error = error;
    });
  };

  setErrorToastMessage = (message: string | null) => {
    runInAction(() => {
      this.errorToastMessage = message;
    });
  };

  registerUser = (user: any) => {
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
        terms: user.terms,
        consent: user.consent,
        preferences: {
          language: user?.language || 'en',
        },
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

  verifyUser = (channel: string, to: string) => {
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

  confirmUser = (to: string, code: string) => {
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

  hydrate = async (profile: Profile | undefined) => {
    if (!profile) return;
    console.log('[auth-store] hydrating profile');
    return new Promise<void>(resolve => {
      runInAction(() => {
        // this.rootStore.profile.hydrate(profile);
        this.rootStore.preferences.hydrate(profile);
        this.rootStore.favorites.hydrate(profile);
        this.rootStore.caregivers.hydrate();
        this.rootStore.schedule.hydrate();
        resolve();
      });
    });
  };

  removeUser = () => {
    runInAction(() => {
      this.inTransaction = true;
    });
    return new Promise(async (resolve, reject) => {
      const token = await this.fetchToken();
      authentication
        .delete(token)
        .then(() => {
          runInAction(() => {
            console.log('user removed');
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

  /**
   * Returns the user object from the database and sets login to true
   * @param {*} email
   * @param {*} password
   * @returns { Promise<Object> || null }
   */
  auth = async (email?: string, password?: string, forgot?: boolean): Promise<User | null> => {
    const refreshToken = this.user?.refreshToken || this.refreshToken;
    runInAction(() => {
      this.inTransaction = true;
    });

    if ((!email || !password) && !refreshToken) {
      console.log('[auth-store] auth missing email/password or token');
      this.reset();
      return null;
    }

    if (refreshToken && validateJWT(refreshToken)) {
      console.log('[auth-store] auth with refreshToken');
      try {
        const token = await this.fetchToken(); //sets this.accessToken
        const user = await this.get(token);
        if (user) {
          runInAction(() => {
            this.requireMFA = false;
            this.user = user;
            this.hydrate(user.profile);
            this.loggedIn = true;
            this.inTransaction = false;
          });
          return Promise.resolve(user);
        } else {
          //SOME ERROR OCCURRED GETTING USER THAT DIDNT THROW AN ERROR
          runInAction(() => {
            this.reset();
          });
          return Promise.reject(
            new Error('An unknown error occurred. Please log in again.')
          );
        }
      } catch (error) {
        runInAction(() => {
          this.reset();
        });
        if (error?.code === 401) {
          runInAction(() => {
            this.errorToastMessage = 'Session expired. Please log in again.';
          });
        }
        return Promise.reject(error);
      }
    } else if (email && password) {
      try {
        console.log('[auth-store] auth with email and password');
        const user = await this.login(email, password);
        if (user) {
          console.log({ user });
          if (user?.profile?.onboarded && !forgot) {
            console.log(
              '[auth-store] auth email password onboarded = true && forgot = false -- forcing MFA'
            );
            runInAction(() => {
              this.requireMFA = true;
              this.contact = {
                email: user.email,
                phone: user.phone,
              };
              this.refreshToken = user.refreshToken;
              this.user = { refreshToken: user.refreshToken };
              this.inTransaction = false;
            });
            return Promise.resolve(null);
          } else {
            console.log(
              '[auth-store] auth email password onboarded = false || forgot = true, skpping MFA'
            );
            console.log(
              '[auth-store] if onboarded = false, user will be prompted to onboard after login, else user is logged in'
            );
            //NOTE the user could change their onboarded status client side - why they would do this, I don't know, but they could and then be able to just login without onboarding and verifying their phone
            runInAction(() => {
              this.accessToken = user.accessToken;
              this.refreshToken = user.refreshToken;
              this.user = user;
              this.hydrate(user.profile);
              this.loggedIn = true;
              this.inTransaction = false;
            });
            return Promise.resolve(user);
          }
        } else {
          return Promise.reject(
            new Error('An unknown error occurred. Please log in again.')
          );
        }
      } catch (error) {
        runInAction(() => {
          this.reset();
        });

        if (error?.code === 401 || error === 'Unauthorized') {
          runInAction(() => {
            this.errorToastMessage = 'Incorrect email or password.';
          });
        }
        return Promise.reject(error);
      }
    } else {
      runInAction(() => {
        this.reset();
      });
      return Promise.reject(new Error('Please log in.'));
    }
  };

  /**
   * Get the user's access token, renewing if necessary.
   * Several modules might call this in parallel, but it won't do a separate query for
   * each one.
   * @returns {Promise} - the user access token.
   */
  fetchToken = (): Promise<string> => {
    if (this.accessTokenPromise) {
      console.log(
        '[auth-store] fetchToken accessTokenPromise exists, returning promise'
      );
      return this.accessTokenPromise;
    }
    const refreshToken = this.user?.refreshToken || this.refreshToken;
    if (!refreshToken) {
      return Promise.reject(new Error('Please login.'));
    }
    if (!validateJWT(refreshToken)) {
      return Promise.reject(new Error('Session expired, please log in again.'));
    }
    if (validateJWT(this.accessToken)) {
      return Promise.resolve(this.accessToken);
    }
    return (this.accessTokenPromise = authentication
      .refreshAccessToken(refreshToken)
      .then(result => {
        this.accessTokenPromise = null;
        if (result.accessToken) {
          runInAction(() => {
            this.accessToken = result.accessToken;
          });
          // console.log(result.accessToken);
          return result.accessToken;
        }
        throw new Error('Error refreshing session, please login again.');
      }));
  };

  /**
   *
   * @param {*} email
   * @param {*} password
   * @param {Boolean} skipMFA //user object/null - //TODO remove all user logic from this function - moving to the auth function - this function should just login the user and return the user object
   * @returns
   */
  login = (email: string, password: string): Promise<User | null> => {
    console.log('[auth-store] logging in');
    runInAction(() => {
      this.inTransaction = true;
    });
    return new Promise((resolve, reject) => {
      authentication
        .login(email, password)
        .then(async result => {
          resolve(result?.profile ? result : null); //profile stores onboarding status so if we dont have that we cant continue
        })
        .catch(e => {
          runInAction(() => {
            this.error = 'Incorrect email or password';
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

  logout = () => {
    runInAction(() => {
      this.setInTransaction(true);
    });
    setTimeout(() => {
      runInAction(() => {
        this.reset();
      });
    }, 1000);
  };

  /**
   * Get the user's access token, renewing if necessary.
   * Several modules might call this in parallel, but it won't do a separate query for
   * each one.
   * @returns {Promise} - the user access token.
   */
  //NOTE REMOVE DEPRECATED - renamed new function to ease merging in git
  fetchAccessToken = skipHydrate => {
    console.log('[auth-store] fetchAccessToken auth flow');

    if (this.accessTokenPromise) {
      console.log('[auth-store] access token promise found');
      return this.accessTokenPromise;
    }

    runInAction(() => {
      this.inTransaction = true;
      this.loggingIn = true;
    });

    if (!this.user?.refreshToken) {
      runInAction(() => {
        console.log('[auth-store--reset] no refresh token found');
        this.reset();
      });
      return Promise.reject(new Error('not logged in'));
    }

    // if invalid - logout, reset store
    if (!validateJWT(this.user.refreshToken)) {
      console.log('[auth-store--reset] invalid refresh token');
      this.reset();
      this.errorToastMessage = 'Session expired, please login.';
    }

    //NOTE this will refresh the user on each page load
    if (validateJWT(this.accessToken)) {
      console.log('[auth-store] valid access token found');

      const accessToken = this.accessToken;
      return new Promise((resolve, reject) => {
        authentication
          .refreshUser(accessToken)
          .then(result => {
            console.log('[auth-store] access token refreshed');
            runInAction(async () => {
              this.requireMFA = false;
              this.loggedIn = true;
              this.loggingIn = false;
              this.inTransaction = false;
              if (!skipHydrate) {
                this.user = result;
                await this.hydrate(result?.profile);
              } else {
                console.log('[auth-store] skipping hydration of user profile');
              }
            });

            resolve(result);
          })
          .catch(e => {
            console.log(e);
            runInAction(() => {
              console.log('[auth-store--reset] error refreshing access token');
              this.reset();
              this.errorToastMessage = 'An unknown error occurred.';
            });
            reject(e);
          })
          .finally(() => {
            runInAction(() => {
              this.inTransaction = false;
            });
          });
      });
    } else {
      if (!this.accessToken) {
        console.log('[auth-store] no access token found');
      } else {
        console.log('[auth-store] invalid access token');
      }
      //NOTE this will refresh the access token if it is missing or invalid/expired
      this.accessTokenPromise = authentication
        .refreshAccessToken((this.user as User).refreshToken || '')
        .then(result => {
          if (result.accessToken) {
            console.log('[auth-store] received access token');
            runInAction(() => {
              this.accessTokenPromise = null;
              this.accessToken = result.accessToken;
              this.fetchAccessToken(skipHydrate).catch(console.error); //NOTE this runs through this function again to hydrate the user
            });
            return result.accessToken;
          }
          throw new Error('user access failed');
        })
        .catch(e => {
          console.log(
            '[auth-store--reset] error on trying to refresh access token'
          );
          console.log(e);
          runInAction(() => {
            this.reset();
            this.errorToastMessage = 'Session expired, please login.';
          });
          throw e;
        });
    }

    return this.accessTokenPromise;
  };

  reset = () => {
    console.log('[auth-store] reset');
    runInAction(() => {
      // this.rootStore.mapManager.hide();
      // this.rootStore.profile.reset();

      this.user = {};
      this.contact = {};
      this.error = null;
      this.loggedIn = false;
      this.loggingIn = false;
      this.registering = false;
      this.rootStore.favorites.reset();
      this.rootStore.schedule.reset();
      this.rootStore.preferences.reset();
      this.rootStore.caregivers.reset();
      this.inTransaction = false;
      this.refreshToken = null;
      this.requireMFA = false;
      this.stagedUser = {};
      this.errorToastMessage = null;
      this.accessToken = null;
      this.accessTokenPromise = null;
    });
  };

  get = async (accessToken: string): Promise<User> => {
    try {
      const user = await authentication.get(accessToken);
      return Promise.resolve(user);
    } catch (error) {
      return Promise.reject('An unknown error occurred fetching the user.');
    }
  };

  updateUser = (user: Partial<User>) => {
    return new Promise<void>(resolve => {
      runInAction(() => {
        this.user = user;
        resolve();
      });
    });
  };

  updateUserProfile = (profile: Profile) => {
    console.log('[auth-store] updateUserProfile');
    runInAction(() => {
      this.inTransaction = true;
    });
    return new Promise(async resolve => {
      const token = await this.fetchToken();
      authentication
        .update({ profile }, token)
        .then(result => {
          runInAction(() => {
            this.user.profile = result?.profile;
            console.log({ result });
            this.rootStore.preferences.hydrate(result?.profile); //needed for the trip store
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

  updateUserPassword = (oldPassword: string, password: string) => {
    runInAction(() => {
      this.inTransaction = true;
    });
    return new Promise(async (resolve, reject) => {
      const token = await this.fetchToken();
      authentication
        .updatePassword(oldPassword, password, token)
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

  updateUserPhone = (phone: string) => {
    runInAction(() => {
      this.inTransaction = true;
    });
    return new Promise(async (resolve, reject) => {
      const token = await this.fetchToken();
      authentication
        .updatePhone(phone, token)
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
