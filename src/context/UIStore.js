import { PersistStoreMap, makePersistable } from 'mobx-persist-store';
import { makeAutoObservable, runInAction } from 'mobx';

class UIStore {
  mode = 'light';
  isLoading = false;
  toastMessage = '';
  toastStatus = '';
  toastTitle = '';
  debug = false;
  ui = {
    contrast: false,
    letterSpacing: 'normal',
    fontSize: 'normal',
    hideImages: false,
    cursor: 'default',
  };

  constructor(rootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;

    if (
      !Array.from(PersistStoreMap.values())
        .map(item => item.storageName)
        .includes('debug')
    )
      makePersistable(this, {
        name: 'UIStore',
        properties: ['mode', 'debug', 'ui'],
        storage: localStorage,
      });
  }

  setUI = value => {
    runInAction(() => {
      this.ui = { ...this.ui, ...value };
    });
  };

  setDebugMode = value => {
    runInAction(() => {
      this.debug = value;
    });
  };

  setToastTitle = value => {
    runInAction(() => {
      this.toastTitle = value;
    });
  };

  setToastMessage = value => {
    runInAction(() => {
      this.toastMessage = value;
    });
  };

  setToastStatus = value => {
    runInAction(() => {
      this.toastStatus = value;
    });
  };

  setLoading = value => {
    runInAction(() => {
      this.isLoading = value;
    });
  };

  setIsLoading = value => {
    runInAction(() => {
      this.isLoading = value;
    });
  };
}
export default UIStore;
