// copied and modified from https://codesandbox.io/s/3p53x?file=/src/hooks/useStores.tsx
// and https://codingislove.com/setup-mobx-react-context/

import { createContext, useContext } from 'react';

import TestStore from './TestStore';

export default class RootStore {
  constructor() {
    this.test = new TestStore(this);
  }
}

const StoreContext = createContext();

export const StoreProvider = ({ children, store }) => (
  <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
);

export const useStore = () => useContext(StoreContext);

export const withStore = Component => props =>
  <Component {...props} store={useStore()} />;
