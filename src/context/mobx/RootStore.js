// copied and modified from https://codesandbox.io/s/3p53x?file=/src/hooks/useStores.tsx
// and https://codingislove.com/setup-mobx-react-context/

import { createContext, useContext } from 'react';

import Authentication from './Authentication';

// import Display from './Display';
// import MapManager from './MapManager';
// import Preferences from './Preferences';
// import React from 'react';
// import Registration from './Registration';

export default class RootStore {
  constructor() {
    this.authentication = new Authentication(this);
    // this.display = new Display(this);
    // this.mapManager = new MapManager(this);
    // this.preferences = new Preferences(this);
    // this.registration = new Registration(this);
  }
}

const StoreContext = createContext();

export const StoreProvider = ({ children, store }) => (
  <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
);

export const useStore = () => useContext(StoreContext);

export const withStore = Component => props =>
  <Component {...props} store={useStore()} />;
