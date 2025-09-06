// import { PersistStoreMap, makePersistable } from 'mobx-persist-store';

import { makeAutoObservable, runInAction, toJS } from 'mobx';
import { SavedLocation, Coordinates, Profile } from '../types/UserProfile';

class Location implements Partial<SavedLocation> {
  id: string;
  title?: string;
  alias?: string;
  description?: string;
  distance?: string | null;
  point: Coordinates;
  text: string;
  name?: string;
  
  constructor(obj: any) {
    this.id = Date.now().toString();
    this.title = obj?.title;
    this.alias = obj?.alias;
    this.description = obj?.description;
    this.distance = obj?.distance || null;
    this.point = {
      lat: obj?.point?.lat || 0,
      lng: obj?.point?.lng || 0
    };
    this.text = this.title + ', ' + this.description;
  }
}

class Favorites {
  locations: Location[] = [];
  trips: any[] = [];
  rootStore: any;

  constructor(rootStore: any) {
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

  updateProperty = (name: string, value: any) => {
    runInAction(() => {
      this[name] = value;
    });
    return this.updateProfile();
  };

  addLocation = (location: any) => {
    const _location = new Location(location);
    const newLocation = { ..._location };
    console.log({ newLocation });
    runInAction(() => {
      this.locations.push(newLocation);
    });
    this.updateProfile();
    return newLocation.id;
  };

  removeLocation = (id: string) => {
    runInAction(() => {
      var i = this.locations.findIndex(l => l.id === id);
      if (i > -1) {
        this.locations.splice(i, 1);
      }
    });
    return this.updateProfile();
  };

  addTrip = async (originId, trip) => {
    let newTrip = { ...trip };
    newTrip.id = Date.now();
    runInAction(() => {
      this.trips.push(newTrip); //add 1 trip works
    });
    const updated = await this.updateProfile();
    if (!updated) return; //TODO this should roll back the store
    const updatedSchedule = await this.rootStore.schedule.updateTripRequest(
      originId,
      newTrip
    );
    if (!updatedSchedule) return; //TODO this should roll back the store

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
    const profile = toJS(this.rootStore.authentication.user.profile) as Profile;
    return await this.rootStore.authentication.updateUserProfile(
      Object.assign(profile, { favorites: this.getAll() })
    );
    // return await this.rootStore.profile.updateProfile();
  };

  hydrate = (profile: Profile) => {
    // console.log('Favorites hydrate', profile);
    if (profile.favorites) {
      runInAction(() => {
        this.locations = (profile.favorites.locations || []).map((loc: any) => new Location(loc));
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
