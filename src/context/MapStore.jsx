import { PersistStoreMap, makePersistable } from 'mobx-persist-store';
import { makeAutoObservable, runInAction } from 'mobx';

class MapStore {
  mapStyle = 'DAY';
  mapState = null;

  constructor(rootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;

    if (!Array.from(PersistStoreMap.values())
      .map((item) => item.storageName)
      .includes('MapMode')
    ) {
      makePersistable(this, {
        name: 'MapMode',
        properties: ['mapStyle'],
        storage: localStorage,
      });
    }
  }

  setMapStyle = style => {
    runInAction(() => {
      this.mapStyle = style;
    });
  }

  setMapState = map => {
    runInAction(() => {
      this.mapState = map;
    });
  }
}

export default MapStore;


// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

// export const useMapStore = create(
//   persist(
//     (set, get) => ({
//       mapStyle: 'DAY',
//       setMapStyle: style => set(() => ({ mapStyle: style })),
//     }),
//     {
//       name: '__mba_maptheme',
//       // partialize: state => ({ user: state.mapStyle }),
//     }
//   )
// );
