// copied and modified from https://codesandbox.io/s/3p53x?file=/src/hooks/useStores.tsx
// and https://codingislove.com/setup-mobx-react-context/

import { createContext, useContext } from 'react';

import Authentication from './Authentication';
import Favorites from './Favorites';
import MapStore from './MapStore';
import Preferences from './Preferences';
import Schedule from './Schedule';
import Trip from './Trip';
import UIStore from './UIStore';

export default class RootStore {
  constructor() {
    this.authentication = new Authentication(this);
    this.uiStore = new UIStore(this);
    this.mapStore = new MapStore(this);
    this.favorites = new Favorites(this);
    this.preferences = new Preferences(this);
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
