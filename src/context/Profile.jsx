// import AsyncStorage from '@react-native-async-storage/async-storage';

import { PersistStoreMap, makePersistable } from 'mobx-persist-store';
import { makeAutoObservable, runInAction } from 'mobx';

import config from '../config';

class Profile {

  firstName = '';
  lastName = '';
  address = {};
  caretakers = [];
  onboarded = false;
  mfa = false;
  preferences = {
    language: 'en',
    wheelchair: false,
    maxCost: 10,
    maxTransfers: 4,
    minimizeWalking: false,
    modes: [],
    notifications: [],
    shareWithConcierge: false,
  }

  constructor(rootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;

    if (!Array.from(PersistStoreMap.values())
      .map((item) => item.storageName)
      .includes('Profile')
    ) {
      makePersistable(this, {
        name: 'Profile',
        properties: ['firstName', 'lastName', 'address', 'caretakers', 'onboarded', 'mfa', 'preferences'],
        storage: localStorage,
      });
    }
  }

  reset() {
    this.firstName = '';
    this.lastName = '';
    this.address = {};
    this.caretakers = [];
    this.onboarded = false;
    this.mfa = false;
    this.preferences = {
      language: 'en',
      wheelchair: false,
      maxCost: 10,
      maxTransfers: 4,
      minimizeWalking: false,
      modes: [],
      notifications: [],
      shareWithConcierge: false,
    };
  }

  updateProperty(name, value, update = true) {
    runInAction(() => {
      this[name] = value;
    });
    if (update) {
      return this.updateProfile();
    }
  }

  addCaretaker(caretaker) {
    runInAction(() => {
      this.caretakers.push(caretaker);
    });
    return this.updateProfile();
  }

  updateCaretaker(caretaker, index) {
    runInAction(() => {
      this.caretakers[index] = caretaker;
    });
    return this.updateProfile();
  }

  removeCaretaker(index) {
    runInAction(() => {
      this.modes.preferences.splice(index, 1);
    });
    return this.updateProfile();
  }

  updatePreference(name, value, update = true) {
    runInAction(() => {
      this.preferences[name] = value;
    });
    if (update) {
      return this.updateProfile();
    }
  }

  addMode(value) {
    runInAction(() => {
      this.preferences.modes.push(value);
    });
    return this.updateProfile();
  }

  removeMode(value) {
    runInAction(() => {
      var i = this.preferences.modes.findIndex(m => m === value);
      if (i > -1) {
        this.preferences.modes.splice(i, 1);
      }
    });
    return this.updateProfile();
  }

  addNotification(value) {
    runInAction(() => {
      this.preferences.notifications.push(value);
    });
    return this.updateProfile();
  }

  removeNotification(value) {
    runInAction(() => {
      var i = this.preferences.notifications.findIndex(m => m === value);
      if (i > -1) {
        this.preferences.notifications.splice(i, 1);
      }
    });
    return this.updateProfile();
  }

  updateProfile() {
    var profile = this.rootStore.authentication?.user?.profile;
    profile.firstName = this.firstName;
    profile.lastName = this.lastName;
    profile.address = this.address;
    profile.caretakers = this.caretakers;
    profile.onboarded = this.onboarded;
    profile.mfa = this.mfa;
    profile.preferences = {
      language: this.preferences.language,
      wheelchair: this.preferences.wheelchair,
      maxCost: this.preferences.maxCost,
      maxTransfers: this.preferences.maxTransfers,
      minimizeWalking: this.preferences.minimizeWalking,
      modes: this.setAndCleanModes(),
      notifications: this.preferences.notifications,
      shareWithConcierge: this.preferences.shareWithConcierge,
    };
    return this.rootStore.authentication.updateUserProfile(profile);
  }

  setAndCleanModes() {
    var modes = [];
    for (var i = 0; i < config.MODES.length; i++) {
      var mode = config.MODES[i].mode;
      if (this.preferences.modes.indexOf(mode) > -1) {
        modes.push(mode);
      }
    }
    return modes;
  }

}

export default Profile;
