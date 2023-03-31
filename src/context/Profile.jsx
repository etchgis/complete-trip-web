import { PersistStoreMap, makePersistable } from 'mobx-persist-store';
import { makeAutoObservable, runInAction } from 'mobx';

/** */
class Profile {

  firstName = '';
  lastName = '';
  address = {};
  caretakers = [];
  onboarded = false;
  mfa = false;

  constructor(rootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;

    if (!Array.from(PersistStoreMap.values())
      .map((item) => item.storageName)
      .includes('Profile')
    ) {
      makePersistable(this, {
        name: 'Profile',
        properties: ['firstName', 'lastName', 'address', 'caretakers', 'onboarded', 'mfa'],
        storage: localStorage,
      });
    }
  }

  reset = () => {
    this.firstName = '';
    this.lastName = '';
    this.address = {};
    this.caretakers = [];
    this.onboarded = false;
    this.mfa = false;
  }

  updateProperty = (name, value) => {
    runInAction(() => {
      this[name] = value;
    });
    return this.updateProfile();
  }

  addCaretaker = (caretaker) => {
    runInAction(() => {
      this.caretakers.push(caretaker);
    });
    return this.updateProfile();
  }

  updateCaretaker = (caretaker, index) => {
    runInAction(() => {
      this.caretakers[index] = caretaker;
    });
    return this.updateProfile();
  }

  removeCaretaker = (index) => {
    runInAction(() => {
      this.modes.preferences.splice(index, 1);
    });
    return this.updateProfile();
  }

  updateProfile = () => {
    var profile = this.rootStore.authentication?.user?.profile;
    profile.firstName = this.firstName;
    profile.lastName = this.lastName;
    profile.address = this.address;
    profile.caretakers = this.caretakers;
    profile.onboarded = this.onboarded;
    profile.mfa = this.mfa;
    profile.preferences = this.rootStore.preferences.getAll();
    profile.favorites = this.rootStore.favorites.getAll();
    return this.rootStore.authentication.updateUserProfile(profile);
  }

  // addMode = (value) => {
  //   runInAction(() => {
  //     this.preferences.modes.push(value);
  //   });
  //   return this.updateProfile();
  // }

  // removeMode = (value) => {
  //   runInAction(() => {
  //     var i = this.preferences.modes.findIndex(m => m === value);
  //     if (i > -1) {
  //       this.preferences.modes.splice(i, 1);
  //     }
  //   });
  //   return this.updateProfile();
  // }

  // addNotification = (value) => {
  //   runInAction(() => {
  //     this.preferences.notifications.push(value);
  //   });
  //   return this.updateProfile();
  // }

  // removeNotification = (value) => {
  //   runInAction(() => {
  //     var i = this.preferences.notifications.findIndex(m => m === value);
  //     if (i > -1) {
  //       this.preferences.notifications.splice(i, 1);
  //     }
  //   });
  //   return this.updateProfile();
  // }

  // setAndCleanModes = () => {
  //   var modes = [];
  //   for (var i = 0; i < config.MODES.length; i++) {
  //     var mode = config.MODES[i].mode;
  //     if (this.preferences.modes.indexOf(mode) > -1) {
  //       modes.push(mode);
  //     }
  //   }
  //   return modes;
  // }

  hydrate = (profile) => {
    // console.log('Profile.hydrate', profile);
    runInAction(() => {
      this.firstName = profile.firstName || '';
      this.lastName = profile.lastName || '';
      this.address = profile.address || {};
      this.caretakers = profile.caretakers || [];
      this.onboarded = profile.onboarded || false;
      this.mfa = profile.mfa || false;
    });
  }

}

export default Profile;
