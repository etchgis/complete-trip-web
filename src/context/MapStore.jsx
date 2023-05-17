import { PersistStoreMap, makePersistable } from 'mobx-persist-store';
import { makeAutoObservable, runInAction } from 'mobx';

import bbox from '@turf/bbox';
import { featureCollection } from '@turf/helpers';
import knn from 'sphere-knn';
import { mobility } from '@etchgis/mobility-transport-layer';
import { sortBy } from 'lodash';
import tinycolor from 'tinycolor2';

const { otp } = mobility;

// const flattenStoptimes = arr => {
//   const array = [];

//   arr.forEach(item => {
//     const itemProps = Object.assign({}, item);
//     delete itemProps.stoptimes;
//     itemProps['stopId'] = item.id;
//     if (item.stoptimes.length) {
//       item.stoptimes.forEach(st => {
//         const patternProps = Object.assign({}, st?.pattern);
//         patternProps['patternId'] = st?.pattern?.id;
//         if (st.times.length) {
//           st.times.forEach(t => {
//             array.push({
//               ...itemProps,
//               ...patternProps,
//               ...t,
//             });
//           });
//         }
//       });
//     } else {
//       array.push(itemProps);
//     }
//   });
//   return array;
// };

class MapStore {
  map = null;
  mapStyle = 'DAY';
  mapState = {
    activeRoute: '',
    patterns: [],
    stoptimes: featureCollection([]),
    routes: [],
    center: [],
    zoom: 12,
    geolocation: [],
  };
  mapCache = {
    routes: [], //cache of routes
    stops: [], //all stops
    stopsIndex: null, //knn index of stops using sphere-knn
  };

  constructor(rootStore) {
    this.initStops();
    this.initRoutes();

    makeAutoObservable(this);
    this.rootStore = rootStore;

    if (
      !Array.from(PersistStoreMap.values())
        .map(item => item.storageName)
        .includes('MapMode')
    ) {
      makePersistable(this, {
        name: 'MapMode',
        properties: ['mapStyle', 'mapCache'],
        storage: localStorage,
      });
    }
  }

  setMap = map => {
    runInAction(() => {
      this.map = map;
    });
  };

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
        const bgColor = routes[i]?.color || '000';
        routes[i].stops = await fetch(
          'https://ctp-otp.etch.app/otp/routers/default/index/routes/' +
            routes[i].id +
            '/stops'
        ).then(res => res.json());
        //this.mapCache.stops.length ? this.mapCache.stops.filter(s => s.routeId === routes[i].id) :
        //TODO convert this to a separate function - getColor
        routes[i]['routeId'] = routes[i].id;

        const isBlackReadable = tinycolor.isReadable(
          '#000',
          '#' + bgColor.replace('#', ''),
          {
            level: 'AAA',
            size: 'small',
          }
        );
        routes[i]['routeColor'] = '#' + bgColor.replace('#', '');
        routes[i]['outlineColor'] = isBlackReadable ? '#121212' : '#fff';
      }

      runInAction(() => {
        this.mapCache.routes = routes;
      });
      console.log('[map-store] init routes done', Date.now() - now);
    } catch (error) {
      //TODO add an alert error here that there is an issue with initializing the routes cache
      console.error(error);
    }
  };

  getRouteColor = r => {
    return r;
  };

  initStops = async () => {
    console.log('[map-store] init stops');
    try {
      const stops = await otp.stops.all('COMPLETE_TRIP');
      if (!stops.length) return console.error('stops not found');
      runInAction(() => {
        this.mapCache.stops = stops;
        this.mapCache.stopsIndex = knn(stops);
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
    geojson['bbox'] = bbox(geojson);

    return geojson;
  };
  //TODO convert map state to mapcache

  getNearestStops = (lat, lng, limit = 20) => {
    if (!this.mapCache.stops.length) return [];
    const _stops = this.mapCache.stopsIndex(lat, lng, limit);
    return this.toPoints(_stops);
  };

  // getPatternStops = async id => {
  //   try {
  //     const app = 'COMPLETE_TRIP';
  //     const stops = await otp.patterns.stops(id, app);
  //     if (!stops.length) throw new Error('No stops found.');
  //     return Promise.resolve(this.toPoints(stops));
  //   } catch (error) {
  //     console.log(error);
  //     return Promise.reject('An error occurred while fetching routes.');
  //   }
  // };

  getRoutes = stops => {
    const routes = [];
    for (let i = 0; i < stops.features.length; i++) {
      const stop = stops.features[i];
      const stopRoutes = this.mapCache.routes.filter(r =>
        r.stops.find(s => s.id === stop.properties.id)
      );
      stopRoutes.forEach(r => {
        if (!routes.find(route => route.id === r.id)) routes.push(r);
      });
    }
    return sortBy(routes, 'longName');
  };

  getRoutePatterns = async id => {
    try {
      const app = 'COMPLETE_TRIP';
      const routePatterns = await otp.routes.one(id, app);
      if (!routePatterns?.patterns?.length)
        throw new Error('No patterns found!');
      const geojson = await this.getRouteGeometry(
        routePatterns.patterns,
        routePatterns?.color
      );
      return Promise.resolve(geojson);
    } catch (error) {
      console.log(error);
      return Promise.reject('An error occurred while fetching routes.');
    }
  };

  getRouteGeometry = async (patterns, color) => {
    try {
      const geojson = {
        type: 'FeatureCollection',
        features: patterns.map(p => {
          p['routeColor'] = color ? '#' + color.replace('#', '') : '#121212';
          const bgColor = color || 'fff';
          const isBlackReadable = tinycolor.isReadable(
            '#000',
            '#' + bgColor.replace('#', ''),
            {
              level: 'AAA',
              size: 'small',
            }
          );
          p['outlineColor'] = isBlackReadable ? '#121212' : '#fff';
          const { geometry, ...properties } = p;
          const feature = {
            type: 'Feature',
            geometry,
            properties,
          };
          return feature;
        }),
      };
      if (!geojson.features.length) throw new Error('No routes found.');
      geojson['bbox'] = bbox(geojson);
      return Promise.resolve(geojson);
    } catch (error) {
      console.log(error);
      return Promise.reject('An error occurred while fetching routes.');
    }
  };

  chunk = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  };

  getRouteStops = async id => {
    try {
      runInAction(() => {
        this.rootStore.uiStore.setLoading(true);
      });
      const stops = this.mapCache.routes.find(r => r.id === id)?.stops || [];
      if (!stops.length) throw new Error('No stops found.');

      //break stops into chunks of stops.length / 5, then call otp.stops.one in a for loop
      const chunks = this.chunk(stops, 5);
      const stoptimes = [];
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        // console.log(chunk.length);
        const results = await Promise.all(
          chunk.map(async s => {
            const pattern = await otp.stops.one(s.id, 'COMPLETE_TRIP');
            if (!pattern.stoptimes || !pattern.stoptimes.length) {
              pattern['stoptimes'] = [];
            } else {
              const _stoptimes = [...pattern.stoptimes];
              pattern.stoptimes = [];
              _stoptimes.forEach(st => {
                if (st?.pattern?.routeId === id) {
                  st.times.forEach(t => {
                    t['arrival'] =
                      (t.serviceDay +
                        (t.realtime ? t.realtimeArrival : t.scheduledArrival)) *
                      1000;
                    if (
                      t?.realtimeArrival &&
                      t?.scheduledArrival &&
                      t?.realtimeArrival !== t?.scheduledArrival &&
                      t?.realtimeArrival > t?.scheduledArrival
                    ) {
                      t['delayed'] = true;
                    } else {
                      t['delayed'] = false;
                    }
                  });
                  pattern.stoptimes.push(st);
                }
              });
            }
            pattern.stoptimes.forEach(st => {
              st.times = st.times.sort((a, b) => a.arrival - b.arrival);
            });
            if (!pattern.stoptimes.length)
              pattern.stoptimes.push({ times: [{ arrival: 0 }] });
            pattern.stoptimes = pattern.stoptimes.sort(
              (a, b) => a.times[0].arrival - b.times[0].arrival
            );
            return pattern;
          })
        );
        stoptimes.push(...results);
      }

      // const flattened = flattenStoptimes(stoptimes);
      stoptimes.forEach(s => {
        if (!s.stoptimes.length) console.log(s);
      });
      const existing = stoptimes.filter(s => s.stoptimes[0].times[0].arrival);
      // if (!existing.length) {
      //   runInAction(() => {
      //     this.rootStore.uiStore.setToastStatus('Error')
      //     this.rootStore.uiStore.setToastMessage('No active stops found.');
      //   })
      //   throw new Error('No stoptimes found.')
      // }
      const missing = stoptimes.filter(s => !s.stoptimes[0].times[0].arrival);
      const sorted = existing.sort(
        (a, b) =>
          a.stoptimes[0].times[0].arrival - b.stoptimes[0].times[0].arrival
      );
      const parsed = [...sorted, ...missing];
      // console.log(id);
      // console.log(parsed)
      const geojson = this.toPoints(parsed);
      runInAction(() => {
        this.mapState.stoptimes = geojson;
        this.rootStore.uiStore.setLoading(false);
      });
      return Promise.resolve(geojson);
    } catch (error) {
      console.log(error);
      runInAction(() => {
        this.rootStore.uiStore.setLoading(false);
      });
      return Promise.reject('An error occurred while fetching routes.');
    }
  };

  setData = (data, type) => {
    runInAction(() => {
      this.mapCache[type] = data;
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
