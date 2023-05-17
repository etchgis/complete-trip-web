import { PersistStoreMap, makePersistable } from 'mobx-persist-store';
import { makeAutoObservable, runInAction } from 'mobx';

class UIStore {
  mode = 'light';
  isLoading = false;
  toastMessage = '';
  toastStatus = '';
  debug = false;

  constructor(rootStore) {
    if (window && window.location) {
      const urlParams = new URLSearchParams(window.location.search);
      const debug = urlParams.get('debug');
      runInAction(() => {
        this.debug = debug === 'true';
      });
    }
    makeAutoObservable(this);
    this.rootStore = rootStore;

    if (
      !Array.from(PersistStoreMap.values())
        .map(item => item.storageName)
        .includes('mode')
    ) {
      makePersistable(this, {
        name: 'UIStore',
        properties: ['mode'],
        storage: localStorage,
      });
    }
  }

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
}
export default UIStore;
