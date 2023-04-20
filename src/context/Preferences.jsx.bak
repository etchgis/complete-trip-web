// import AsyncStorage from '@react-native-async-storage/async-storage';

// import { PersistStoreMap, makePersistable } from 'mobx-persist-store';

import { makeAutoObservable, runInAction } from 'mobx';

import config from '../config';

class Preferences {

  language = 'en';
  wheelchair = false;
  maxCost = 10;
  maxTransfers = 4;
  minimizeWalking = false;
  modes = [];
  notifications = [];
  shareWithConcierge = false;

  constructor(rootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;

    // if (!Array.from(PersistStoreMap.values())
    //   .map((item) => item.storageName)
    //   .includes('Preferences')
    // ) {
    //   makePersistable(this, {
    //     name: 'Preferences',
    //     properties: ['language', 'wheelchair', 'maxCost', 'maxTransfers', 'minimizeWalking', 'modes', 'notifications', 'shareWithConcierge'],
    //     storage: localStorage,
    //   });
    // }
  }

  updateProperty = (name, value) => {
    runInAction(() => {
      this[name] = value;
    });
    return this.updateProfile();
  }

  addMode = (value) => {
    runInAction(() => {
      this.modes.push(value);
    });
    return this.updateProfile();
  }

  removeMode = (value) => {
    runInAction(() => {
      var i = this.modes.findIndex(m => m === value);
      if (i > -1) {
        this.modes.splice(i, 1);
      }
    });
    return this.updateProfile();
  }

  addNotification = (value) => {
    runInAction(() => {
      this.notifications.push(value);
    });
    return this.updateProfile();
  }

  removeNotification = (value) => {
    runInAction(() => {
      var i = this.notifications.findIndex(m => m === value);
      if (i > -1) {
        this.notifications.splice(i, 1);
      }
    });
    return this.updateProfile();
  }

  updateProfile = () => {
    this.rootStore.profile.updateProfile();
  }

  getAll = () => {
    return {
      language: this.language,
      wheelchair: this.wheelchair,
      maxCost: this.maxCost,
      maxTransfers: this.maxTransfers,
      minimizeWalking: this.minimizeWalking,
      modes: this.setAndCleanModes(),
      notifications: this.notifications,
      shareWithConcierge: this.shareWithConcierge,
    };
  }

  setAndCleanModes = () => {
    var modes = [];
    for (var i = 0; i < config.MODES.length; i++) {
      var mode = config.MODES[i].mode;
      if (this.modes.indexOf(mode) > -1) {
        modes.push(mode);
      }
    }
    return modes;
  }

  reset = () => {
    runInAction(() => {
      this.language = 'en';
      this.wheelchair = false;
      this.maxCost = 10;
      this.maxTransfers = 4;
      this.minimizeWalking = false;
      this.modes = [];
      this.notifications = [];
      this.shareWithConcierge = false;
    });
  }

  hydrate = (profile) => {
    if (profile.preferences) {
      // console.log('Preferences.hydrate', profile.preferences);
      runInAction(() => {
        this.language = profile.preferences.language || 'en';
        this.wheelchair = profile.preferences.wheelchair || false;
        this.maxCost = profile.preferences.maxCost || 10;
        this.maxTransfers = profile.preferences.maxTransfers || 4;
        this.minimizeWalking = profile.preferences.minimizeWalking || false;
        this.modes = profile.preferences.modes || [];
        this.notifications = profile.preferences.notifications || [];
        this.shareWithConcierge = profile.preferences.shareWithConcierge || false;
      });
    }
  }

}

export default Preferences;
