import { PersistStoreMap, makePersistable } from 'mobx-persist-store';
import { featureCollection, point } from '@turf/helpers';
import { makeAutoObservable, runInAction } from 'mobx';

import bbox from '@turf/bbox';
import buffer from '@turf/buffer';
import knn from 'sphere-knn';
import { mobility } from '@etchgis/mobility-transport-layer';
import within from '@turf/boolean-within';

const { otp } = mobility;

class MapStore {
  mapStyle = 'DAY';
  mapState = {
    patterns: [],
    routes: [],
    center: [],
    zoom: 12,
  };
  routes = []; //cache of routes
  featuresCache = []; //cache of features
  mapData = {
    stops: [], //all stops
    stopsIndex: null, //knn index of stops using sphere-knn
  };

  constructor(rootStore) {
    this.initRoutes();
    this.initStops();

    makeAutoObservable(this);
    this.rootStore = rootStore;

    if (
      !Array.from(PersistStoreMap.values())
        .map(item => item.storageName)
        .includes('MapMode')
    ) {
      makePersistable(this, {
        name: 'MapMode',
        properties: ['mapStyle'],
        storage: localStorage,
      });
    }
  }

  setMapState = (key, value) => {
    runInAction(() => {
      this.mapState[key] = value;
    });
  };

  initRoutes = async () => {
    console.log('[map-store] init routes');
    let now = Date.now();
    try {
      const routes = await fetch(
        'https://ctp-otp.etch.app/otp/routers/default/index/routes'
      ).then(res => res.json());
      if (!routes.length) return console.error('routes not found');
      for (let i = 0; i < routes.length; i++) {
        routes[i].stops = await fetch(
          'https://ctp-otp.etch.app/otp/routers/default/index/routes/' +
            routes[i].id +
            '/stops'
        ).then(res => res.json());
        routes[i]['routeId'] = routes[i].id;
      }
      runInAction(() => {
        this.routes = routes;
      });
      console.log('[map-store] init routes done', Date.now() - now);
    } catch (error) {
      //TODO add an alert error here that there is an issue with initializing the routes cache
      console.error(error);
    }
  };

  initStops = async () => {
    console.log('[map-store] init stops');
    try {
      const stops = await otp.stops.all('COMPLETE_TRIP');
      if (!stops.length) return console.error('stops not found');
      runInAction(() => {
        this.mapData.stops = stops;
        this.mapData.stopsIndex = knn(stops);
      });
      console.log('[map-store] init stops done');
    } catch (error) {
      console.error(error);
    }
  };

  toPoints = data => {
    const geojson = featureCollection([]);
    for (let i = 0; i < data.length; i++) {
      const feature = {
        id:
          data[i].code ||
          data[i].lat.toString().split('.')[1] ||
          +Math.random().toString().split('.')[1],
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [data[i].lon, data[i].lat],
        },
        properties: data[i],
      };
      geojson.features.push(feature);
    }
    return geojson;
  };

  getNearestStops = (lat, lng, limit = 10) => {
    if (!this.mapData.stops.length) return [];
    // const stops = this.mapData.stops;
    // const circle = buffer(point([lng, lat]), 1, { units: 'kilometers' });
    // const nearestStops = [];
    // for (let i = 0; i < stops.length; i++) {
    //   const stop = stops[i];
    //   if (within(point([stop.lon, stop.lat]), circle)) {
    //     nearestStops.push();
    //   }
    // }
    const _stops = this.mapData.stopsIndex(lat, lng, limit);
    return this.toPoints(_stops);
  };

  getRoutePatternGeometry = async pattern => {
    const { id } = pattern;
    try {
      const app = 'COMPLETE_TRIP',
        geojson = featureCollection([]);
      const geometry = await otp.patterns.geometry(id, app);
      const stops = await otp.patterns.stops(id, app);
      if (geometry) {
        const feature = {
          type: 'Feature',
          geometry,
          properties: { ...pattern, stops: stops },
        };
        geojson.features.push(feature);
      }

      if (!geojson.features.length) throw new Error('No routes found.');
      geojson['bbox'] = bbox(geojson);
      return Promise.resolve(geojson);
    } catch (error) {
      console.log(error);
      return Promise.reject('An error occurred while fetching routes.');
    }
  };

  getRoutePatterns = async id => {
    try {
      const app = 'COMPLETE_TRIP';
      const routePatterns = await otp.routes.patterns(id, app);
      return Promise.resolve(routePatterns);
    } catch (error) {
      console.log(error);
      return Promise.reject('An error occurred while fetching routes.');
    }
  };

  getRoutes = stops => {
    const routes = [];
    for (let i = 0; i < stops.features.length; i++) {
      const stop = stops.features[i];
      const stopRoutes = this.routes.filter(r =>
        r.stops.find(s => s.id === stop.properties.id)
      );
      stopRoutes.forEach(r => {
        if (!routes.find(route => route.id === r.id)) routes.push(r);
      });
    }
    return routes;
  };

  getPatternStopTimes = async id => {
    try {
      const app = 'COMPLETE_TRIP';
      const routeStopTimes = await otp.patterns.stops(id, app);
      return Promise.resolve(routeStopTimes);
    } catch (error) {
      console.log(error);
      return Promise.reject('An error occurred while fetching routes.');
    }
  };

  setData = (data, type) => {
    runInAction(() => {
      this.mapData[type] = data;
    });
  };

  setMapStyle = style => {
    runInAction(() => {
      this.mapStyle = style;
    });
  };
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
