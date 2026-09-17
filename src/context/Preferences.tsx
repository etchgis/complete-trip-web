import { makeAutoObservable, runInAction, toJS } from 'mobx';
import config from '../config';
import { Preferences as PreferencesType, Profile, Language, ApiTransportMode, NotificationType } from '../types/UserProfile';

class Preferences implements PreferencesType {
  language: Language = 'en';
  wheelchair = false;
  serviceAnimal = false;
  maxCost = 10;
  maxTransfers = 4;
  minimizeWalking = false;
  modes: ApiTransportMode[] = [];
  notifications: ('sms' | 'email')[] = [];
  notificationTypes: NotificationType[] = [];
  shareWithConcierge = false;
  navigationDirections: 'voiceOn' | 'voiceOff' = 'voiceOn';
  pin?: string = '';
  rootStore: any;

  constructor(rootStore: any) {
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

  updateProperty = (name: string, value: any) => {
    runInAction(() => {
      (this as any)[name] = value;
    });
    return this.updateProfile();
  };

  addMode = (value: ApiTransportMode) => {
    runInAction(() => {
      this.modes.push(value);
    });
    return this.updateProfile();
  };

  removeMode = (value: ApiTransportMode) => {
    runInAction(() => {
      var i = this.modes.findIndex(m => m === value);
      if (i > -1) {
        this.modes.splice(i, 1);
      }
    });
    return this.updateProfile();
  };

  addNotification = (value: 'sms' | 'email') => {
    runInAction(() => {
      this.notifications.push(value);
    });
    return this.updateProfile();
  };

  removeNotification = (value: 'sms' | 'email') => {
    runInAction(() => {
      var i = this.notifications.findIndex(m => m === value);
      if (i > -1) {
        this.notifications.splice(i, 1);
      }
    });
    return this.updateProfile();
  };

  addNotificationType = (values: NotificationType[]) => {
    runInAction(() => {
      this.notificationTypes.push(...values);
    });
    return this.updateProfile();
  };

  removeNotificationType = (values: NotificationType[]) => {
    runInAction(() => {
      for (let i = 0; i < values.length; i++) {
        const value = values[i];
        var j = this.notificationTypes.findIndex(m => m === value);
        if (j > -1) {
          this.notificationTypes.splice(j, 1);
        }
      }
    });
    return this.updateProfile();
  };

  updateProfile = () => {
    const profile = this.rootStore.authentication?.user?.profile;
    const update = {
      ...profile,
      preferences: this.getAll(),
    };
    console.log('{preferences.updateProfile}', update);
    this.rootStore.authentication.updateUserProfile(update);
  };

  getAll = (): PreferencesType => {
    return {
      language: this.language,
      wheelchair: this.wheelchair,
      serviceAnimal: this.serviceAnimal,
      maxCost: this.maxCost,
      maxTransfers: this.maxTransfers,
      minimizeWalking: this.minimizeWalking,
      modes: this.setAndCleanModes(),
      notifications: this.notifications,
      notificationTypes: this.setAndCleanNotificationTypes(),
      shareWithConcierge: this.shareWithConcierge,
      navigationDirections: this.navigationDirections,
    };
  };

  setAndCleanModes = () => {
    var modes = [];
    for (var i = 0; i < config.MODES.length; i++) {
      var mode = config.MODES[i].mode;
      if (this.modes.indexOf(mode as ApiTransportMode) > -1) {
        modes.push(mode as ApiTransportMode);
      }
    }
    return modes;
  };

  setAndCleanNotificationTypes = () => {
    let nTypes = [];

    for (let i = 0; i < config.NOTIFICATION_TYPES.caregiver.length; i++) {
      let types = config.NOTIFICATION_TYPES.caregiver[i].types;
      for (let j = 0; j < types.length; j++) {
        let type = types[j];
        if (this.notificationTypes.indexOf(type as NotificationType) > -1) {
          nTypes.push(type as NotificationType);
        }
      }
    }

    for (let i = 0; i < config.NOTIFICATION_TYPES.traveler.length; i++) {
      let types = config.NOTIFICATION_TYPES.traveler[i].types;
      for (let j = 0; j < types.length; j++) {
        let type = types[j];
        if (this.notificationTypes.indexOf(type as NotificationType) > -1) {
          nTypes.push(type as NotificationType);
        }
      }
    }

    return nTypes;
  };

  reset = () => {
    runInAction(() => {
      this.language = 'en';
      this.wheelchair = false;
      this.maxCost = 10;
      this.maxTransfers = 4;
      this.minimizeWalking = false;
      this.modes = [];
      this.notifications = [];
      this.notificationTypes = [];
      this.shareWithConcierge = false;
      this.navigationDirections = 'voiceOn';
    });
  };

  hydrate = (profile: Profile) => {
    if (profile.preferences) {
      // console.log('Preferences.hydrate', profile.preferences);
      runInAction(() => {
        this.language = profile.preferences.language || 'en';
        this.wheelchair = profile.preferences.wheelchair || false;
        this.serviceAnimal = profile.preferences.serviceAnimal || false;
        this.maxCost = profile.preferences.maxCost || 10;
        this.maxTransfers = profile.preferences.maxTransfers || 4;
        this.minimizeWalking = profile.preferences.minimizeWalking || false;
        this.modes = profile.preferences.modes || [];
        this.notifications = profile.preferences.notifications || [];
        this.notificationTypes = profile.preferences.notificationTypes || [];
        this.shareWithConcierge = profile.preferences.shareWithConcierge || false;
        this.navigationDirections = profile.preferences.navigationDirections || 'voiceOn';
        this.pin = profile.preferences.pin || '';
      });
    }
  };
}

export default Preferences;
