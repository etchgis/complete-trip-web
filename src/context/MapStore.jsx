import { PersistStoreMap, makePersistable } from 'mobx-persist-store';
import { makeAutoObservable, runInAction } from 'mobx';

import bbox from '@turf/bbox';
import { featureCollection } from '@turf/helpers';
import { mobility } from '@etchgis/mobility-transport-layer';

class MapStore {
  map = null;
  mapStyle = 'DAY';
  mapState = {
    activeRoute: '',
    patterns: [],
    stoptimes: featureCollection([]),
    routes: [],
    vehicles: [],
    center: [],
    zoom: 12,
    geolocation: [],
    routesLoading: true,
    stopsLoading: false,
  };
  mapCache = {
    routes: [], //cache of routes
    stops: [], //all stops
  };

  constructor(rootStore) {
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
    const { lng, lat } = map.getCenter();
    this.getRoutes(lng, lat);
  };

  setMapState = (key, value) => {
    runInAction(() => {
      this.mapState[key] = value;
    });
  };

  getRouteColor = r => {
    return r;
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

  getRoutes = (lng, lat) => {
    runInAction(() => {
      this.mapState.routesLoading = true;
    });
    mobility.skids.services
      .byDistance(lng, lat, 0.5, 'COMPLETE_TRIP')
      .then(values => {
        console.log('got service: count', values.length);
        runInAction(() => {
          this.mapCache.routes = values.filter(v => v.mode !== 'shuttle');
          this.mapState.routesLoading = false;
        });
      })
      .catch(e => {
        runInAction(() => {
          this.mapState.routesLoading = false;
        });
        console.log('skids service error', e);
      });
  };

  getStops = async (service, showLoading = false) => {
    runInAction(() => {
      this.mapState.stopsLoading = showLoading;
    });
    return new Promise((resolve, reject) => {
      mobility.skids.feeds
        .get(service.service, service.route.patternId, 'COMPLETE_TRIP')
        .then(result => {
          let route = {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {
                  routeColor: `#${result.color || '004490'}`,
                  outlineColor: `#${result.textColor || 'ffffff'}`,
                },
                geometry: {
                  type: 'LineString',
                  coordinates: result.coordinates,
                },
              },
            ],
          };
          route.bbox = bbox(route);

          let stops = {
            type: 'FeatureCollection',
            features: [],
          };
          let gotFirst = false;
          for (var i = 0; i < result.stops.length; i++) {
            let stop = result.stops[i];
            if (gotFirst || stop.stopId === service?.location?.id) {
              gotFirst = true;
              if (result?.stopTimes?.currentTimes[i]) {
                stop.arrive = result.stopTimes.currentTimes[i].arrive;
              }
              if (result?.stopTimes?.nextTimes[i]) {
                stop.arriveNext = result.stopTimes.nextTimes[i].arrive;
              }
              stop.filter = true;
            } else {
              stop.filter = false;
            }
            stops.features.push({
              type: 'Feature',
              properties: {
                color: `#${result.color || '004490'}`,
                textColor: `#${result.textColor || 'ffffff'}`,
                id: stop.stopId,
                name: stop.name,
                publicCode: stop.publicCode,
                arrive: stop.arrive,
                arriveNext: stop.arriveNext,
                routes: stop.routes,
                filter: stop.filter,
              },
              geometry: stop.geometry,
            });
          }

          let vehicles = {
            type: 'FeatureCollection',
            features: [],
          };
          if (result.vehicles && result.vehicles.length) {
            for (var i = 0; i < result.vehicles.length; i++) {
              let vehicle = result.vehicles[i];
              vehicles.features.push({
                type: 'Feature',
                properties: {
                  icon: 'bus-live',
                },
                geometry: {
                  type: 'Point',
                  coordinates: vehicle.coordinates,
                },
              });
            }
          }

          runInAction(() => {
            this.mapState.routes = route;
            this.mapState.stoptimes = stops;
            this.mapState.vehicles = vehicles;
            this.mapState.stopsLoading = false;
          });
          resolve({ route, stops, vehicles });
        })
        .catch(e => {
          runInAction(() => {
            this.mapState.stopsLoading = false;
          });
          console.log('skids feed error', e);
          reject('An error occurred while fetching routes.');
        });
    });
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
