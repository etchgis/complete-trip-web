import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeAutoObservable, runInAction } from 'mobx';
import { makePersistable, PersistStoreMap } from 'mobx-persist-store';

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

    if (!Array.from(PersistStoreMap.values())
      .map((item) => item.storageName)
      .includes('Display')
    ) {
      makePersistable(this, {
        name: 'Preferences',
        properties: ['user'],
        storage: AsyncStorage,
      });
    }
  }

  updateProperty(name, value, update = true) {
    runInAction(() => {
      this[name] = value;
    });
    if (update) {
      this.updateProfile();
    }
  }

  addMode(value) {
    runInAction(() => {
      this.modes.push(value);
    });
    this.updateProfile();
  }

  removeMode(value) {
    runInAction(() => {
      var i = this.modes.findIndex(m => m === value);
      if (i > -1) {
        this.modes.splice(i, 1);
      }
    });
    this.updateProfile();
  }

  addNotification(value) {
    runInAction(() => {
      this.notifications.push(value);
    });
    this.updateProfile();
  }

  removeNotification(value) {
    runInAction(() => {
      var i = this.notifications.findIndex(m => m === value);
      if (i > -1) {
        this.notifications.splice(i, 1);
      }
    });
    this.updateProfile();
  }

  updateProfile() {
    var profile = this.rootStore.authentication?.user?.profile;
    profile.preferences = {
      language: this.language,
      wheelchair: this.wheelchair,
      maxCost: this.maxCost,
      maxTransfers: this.maxTransfers,
      minimizeWalking: this.minimizeWalking,
      modes: this.modes,
      notifications: this.notifications,
      shareWithConcierge: this.shareWithConcierge,
    };
    this.rootStore.authentication.updateUserProfile(profile);
  }

}

export default Preferences;
