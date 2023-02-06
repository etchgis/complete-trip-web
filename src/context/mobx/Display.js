// import AsyncStorage from '@react-native-community/async-storage';
import { makeAutoObservable, runInAction } from 'mobx';
// import { makePersistable, PersistStoreMap } from 'mobx-persist-store';
import { StatusBar } from 'react-native';

class Display {
  mode = 'light';

  constructor(rootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;

    // if (!Array.from(PersistStoreMap.values())
    //   .map((item) => item.storageName)
    //   .includes('Display')
    // ) {
    //   makePersistable(this, {
    //     name: 'Display',
    //     properties: ['mode'],
    //     storage: AsyncStorage,
    //   });
    // }
  }

  updateMode(mode) {
    runInAction(() => {
      this.mode = mode;
    });
  }

  updateStatusBarStyle(style) {
    StatusBar.setBarStyle(style, true);
  }
}

export default Display;
