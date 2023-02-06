// import AsyncStorage from '@react-native-async-storage/async-storage';

import { PersistStoreMap, makePersistable } from 'mobx-persist-store';
import { makeAutoObservable, runInAction } from 'mobx';

import { authentication } from '../../services/transport';
import jwtDecode from 'jwt-decode';

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

  clearError() {
    runInAction(() => {
      this.error = null;
    });
  }

  /**
   * Get the user's access token, renewing if necessary.
   * Several modules might call this in parallel, but it won't do a separate query for
   * each one.
   * @returns {Promise} - the user access token.
   */
  fetchAccessToken() {
    if (this.accessTokenPromise) {
      return this.accessTokenPromise;
    }
    if (!this.user?.refreshToken) {
      return Promise.reject(new Error('not logged in'));
    }
    if (validateJWT(this.user.accessToken)) {
      return Promise.resolve(this.user.accessToken);
    }
    this.accessTokenPromise = authentication
      .refreshAccessToken(this.user.refreshToken)
      .then(result => {
        this.accessTokenPromise = null;
        if (result.accessToken) {
          const refreshedUser = this.user;
          refreshedUser.accessToken = result.accessToken;
          runInAction(() => {
            this.user = refreshedUser;
          });
          return result.accessToken;
        }
        throw new Error('user access failed');
      });
    return this.accessTokenPromise;
  }

  login(email, password) {
    runInAction(() => {
      this.loggingIn = true;
    });
    return new Promise((resolve, reject) => {
      authentication
        .login(email, password)
        .then(async result => {
          runInAction(() => {
            this.user = result;
            if (result?.profile?.preferences) {
              var prefs = result.profile.preferences;
              for (var key in prefs) {
                this.rootStore.preferences.updateProperty(
                  key,
                  prefs[key],
                  false
                );
              }
            }
            this.error = null;
            this.loggingIn = false;
            this.loggedIn = true;
          });
          resolve(true);
        })
        .catch(e => {
          runInAction(() => {
            this.error = 'Incorrect email or password';
            this.loggingIn = false;
          });
          reject(e);
        });
    });
  }

  logout() {
    this.reset();
  }

  setLoggedIn(loggedIn) {
    runInAction(() => {
      this.loggedIn = loggedIn;
    });
  }

  reset() {
    runInAction(() => {
      this.rootStore.mapManager.hide();
      this.user = {};
      this.error = null;
      this.loggingIn = false;
      this.loggedIn = false;
      this.registering = false;
    });
  }

  updateUser = user => {
    runInAction(() => {
      this.user = user;
    });
  };

  updateUserProfile(profile) {
    return new Promise(resolve => {
      authentication
        .update({ profile }, this.user.accessToken)
        .then(result => {
          runInAction(() => {
            this.user.profile = result?.profile;
          });
          resolve(profile);
        })
        .catch(e => {
          console.warn(e);
          resolve({ error: e });
        });
    });
  }
}

export default Authentication;
