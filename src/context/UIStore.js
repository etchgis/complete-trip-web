import { PersistStoreMap, makePersistable } from 'mobx-persist-store';
import { makeAutoObservable, runInAction } from 'mobx';
import { set } from 'lodash';

class UIStore {
  mode = 'light';
  isLoading = false;
  toastMessage = '';
  toastStatus = '';
  toastTitle = '';
  debug = false;
  ux = 'webapp'; //kiosk, webapp
  onScreenKeyboardInput = {
    transitSearch: '',
    startAddress: '',
    endAddress: '',
    pin: '',
    phone: ''
  };
  activeInput = 'transitSearch';
  keyBoardType = 'default';
  ui = {
    contrast: false,
    letterSpacing: 'normal',
    fontSize: 'normal',
    hideImages: false,
    cursor: 'default',
    language: 'en',
  };
  hasSelectedPlan = false;

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
        properties: ['mode', 'debug', 'ui', 'ux'],
        storage: localStorage,
      });
  }

  setKeyboardActiveInput = value => {
    //NOTE this would reset the state of the keyboard input for the active input
    // const newState = { ...this.onScreenKeyboardInput };
    // newState[value] = '';
    runInAction(() => {
      this.activeInput = value;
      // this.onScreenKeyboardInput = { ...newState };
    });
  };

  getKeyboardInputValue = inputName => {
    return this.onScreenKeyboardInput[inputName];
  };

  clearKeyboardInputValues = () => {
    const emptyState = {
      transitSearch: '',
      startAddress: '',
      endAddress: '',
    };
    runInAction(() => {
      this.onScreenKeyboardInput = { ...emptyState };
      this.activeInput = 'transitSearch';
    });
  };

  setKeyboardInputValue = value => {
    runInAction(() => {
      const newInput = { ...this.onScreenKeyboardInput };
      newInput[this.activeInput] = value;
      this.onScreenKeyboardInput = { ...newInput };
    });
  };

  setKeyboardType = value => {
    runInAction(() => {
      this.keyBoardType = value;
    });
  }

  setUX = value => {
    runInAction(() => {
      this.ux = value;
    });
  };

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

  setHasSelectedPlan = value => {
    runInAction(() => {
      this.hasSelectedPlan = value;
    });
  };
}
export default UIStore;
