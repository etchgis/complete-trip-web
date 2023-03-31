// copied and modified from https://codesandbox.io/s/3p53x?file=/src/hooks/useStores.tsx
// and https://codingislove.com/setup-mobx-react-context/

import { createContext, useContext } from 'react';

import Authentication from './Authentication';
import Favorites from './Favorites';
import Preferences from './Preferences';
import Profile from './Profile';
import Schedule from './Schedule';
import Trip from './Trip';

// import Display from './Display';
// import MapManager from './MapManager';

// import Registration from './Registration';

export default class RootStore {
  constructor() {
    this.authentication = new Authentication(this);
    // this.display = new Display(this);
    this.favorites = new Favorites(this);
    // this.mapManager = new MapManager(this);
    // this.navigation = new Navigation();
    this.preferences = new Preferences(this);
    this.profile = new Profile(this);
    // this.registration = new Registration(this);
    this.schedule = new Schedule(this);
    this.trip = new Trip(this);
  }
}

const StoreContext = createContext();

export const StoreProvider = ({ children, store }) => (
  <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
);

export const useStore = () => useContext(StoreContext);

export const withStore = Component => props =>
  <Component {...props} store={useStore()} />;
