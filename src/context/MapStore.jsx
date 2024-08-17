import { PersistStoreMap, makePersistable } from 'mobx-persist-store';
import { makeAutoObservable, runInAction } from 'mobx';

import bbox from '@turf/bbox';
import { featureCollection } from '@turf/helpers';
import { mobility } from '@etchgis/mobility-transport-layer';

const NftaCommunityShuttle = {
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "lineColor": "000000",
        "lineWidth": 6,
        "lineOpacity": 1,
        "lineJoin": "round"
      },
      "geometry": {
        "coordinates": [
          [
            [
              -78.85384916648493,
              42.9124701546819
            ],
            [
              -78.85507903356856,
              42.9124713448401
            ],
            [
              -78.8550894892179,
              42.90574191696224
            ],
            [
              -78.86797970146861,
              42.90587332104661
            ],
            [
              -78.87145056227227,
              42.89517836825209
            ],
            [
              -78.86746962662272,
              42.89448984068328
            ],
            [
              -78.8631245362534,
              42.89378130319588
            ],
            [
              -78.85839764459705,
              42.895756386003654
            ],
            [
              -78.85600233523127,
              42.896733924337596
            ],
            [
              -78.85382551869739,
              42.89780483321695
            ],
            [
              -78.85385354042101,
              42.909323318170394
            ],
            [
              -78.85204551701361,
              42.90930139932462
            ],
            [
              -78.85204201453207,
              42.91022438036715
            ],
            [
              -78.85386277778726,
              42.91024693365033
            ],
            [
              -78.85384916648493,
              42.9124701546819
            ]
          ]
        ],
        "type": "Polygon"
      }
    }
  ]
};

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

    const appMode = this.rootStore.uiStore.ux;
    console.log('appMode', appMode);
    if (appMode === 'kiosk') {
      console.log('setting nfta-community-shuttle');
      console.log(this.map.getSource('nfta-community-shuttle'));
      this.map.getSource('nfta-community-shuttle').setData(NftaCommunityShuttle);
    }
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

  getRoutes = (lng, lat, n = 0) => {
    runInAction(() => {
      this.mapState.routesLoading = true;
    });
    const appMode = this.rootStore.uiStore.ux;
    mobility.skids.services
      .byDistance(lng, lat, 0.5, 'COMPLETE_TRIP')
      .then(values => {
        console.log('got service: count', values.length);
        if (values.length === 0 && n < 2) {
          return this.getRoutes(lng, lat, n + 1);
        }
        runInAction(() => {
          this.mapCache.routes = values.filter(v => (appMode === 'webapp') ? v.mode !== 'shuttle' : v.service !== 'a931ba8e-d18b-4b29-9de9-6df61ff1fa02');
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

  updateShuttle = (featureCollection) => {
    if (this.map) {
      const s = this.map.getSource('shuttle-live');
      this.map.getSource('shuttle-live').setData(featureCollection);
    }
  }
}

export default MapStore;
