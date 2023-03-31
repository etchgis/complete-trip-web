// import { PersistStoreMap, makePersistable } from 'mobx-persist-store';

import { makeAutoObservable, runInAction } from 'mobx';

class Favorites {
  locations = [];
  trips = [];

  constructor(rootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;

    // if (
    //   !Array.from(PersistStoreMap.values())
    //     .map(item => item.storageName)
    //     .includes('Favorites')
    // ) {
    //   makePersistable(this, {
    //     name: 'Favorites',
    //     properties: ['locations', 'trips'],
    //     storage: localStorage,
    //   });
    // }
  }

  updateProperty = (name, value) => {
    runInAction(() => {
      this[name] = value;
    });
    return this.updateProfile();
  };

  addLocation = location => {
    let newLocation = { ...location };
    newLocation.id = Date.now();
    runInAction(() => {
      this.locations.push(location);
    });
    this.updateProfile();
    return newLocation.id;
  };

  removeLocation = id => {
    runInAction(() => {
      var i = this.locations.findIndex(l => l.id === id);
      if (i > -1) {
        this.locations.splice(i, 1);
      }
    });
    return this.updateProfile();
  };

  addTrip = async (originId, trip) => {
    const newTrip = { ...trip, id: Date.now() };
    console.log({ newTrip });
    runInAction(() => {
      this.trips.push(newTrip); //add 1 trip works
      // this.trips = []; //this works
    });
    console.log(this.trips);
    const updated = await this.updateProfile();
    if (!updated) return;
    console.log({ updated });
    console.log('addTrip', originId, newTrip.id);
    // await this.rootStore.schedule.updateTripRequest(
    //   originId,
    //   newTrip,
    //   this.rootStore.authentication.user.accessToken
    // );

    return newTrip.id;
  };

  removeTrip = id => {
    runInAction(() => {
      var i = this.trips.findIndex(t => t.id === id);
      console.log('removeTrip', id, i);
      if (i > -1) {
        this.trips.splice(i, 1);
      }
    });
    return this.updateProfile();
  };

  getAll = () => {
    return {
      locations: this.locations,
      trips: this.trips,
    };
  };

  updateProfile = async () => {
    return await this.rootStore.profile.updateProfile();
  };

  hydrate = profile => {
    // console.log('Favorites hydrate', profile);
    if (profile.favorites) {
      runInAction(() => {
        this.locations = profile.favorites.locations || [];
        this.trips = profile.favorites.trips || [];
      });
    }
  };

  reset = () => {
    runInAction(() => {
      this.locations = [];
      this.trips = [];
    });
  };
}

export default Favorites;
