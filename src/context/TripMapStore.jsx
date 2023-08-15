import { feature, featureCollection } from '@turf/helpers';
import { makeAutoObservable, runInAction } from 'mobx';

import config from '../config';
import nearestPointOnLine from '@turf/nearest-point-on-line';
import { toGeoJSON } from '../utils/polyline';

const layers = {
  route: featureCollection([]),
  stops: featureCollection([]),
  modeIcons: featureCollection([]),
  user: featureCollection([]),
};

class TripMapStore {
  map = null;
  mapStyle = 'DAY';
  layers = { ...{}, ...layers };
  activeLegIndex = -1;
  socket = null;

  constructor(rootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  setMap = map => {
    runInAction(() => {
      this.map = map;
    });
  };

  setData = plan => {
    runInAction(() => {
      this.layers.route.features = generateRoute(plan)?.features;
      this.layers.stops.features = generateIntermediateStops(plan)?.features;
      this.layers.modeIcons.features = generateModeIconSymbols(
        plan,
        this.rootStore.preferences.wheelchair
      )?.features;
    });
    console.log(layers);
    return this.layers;
  };

  setActiveLeg = index => {
    if (!this.layers?.route?.features?.length) return;
    if (index === this.activeLegIndex) return;
    if (index === -1) {
      runInAction(() => {
        this.activeLegIndex = -1;
      });
      return;
    }
    runInAction(() => {
      console.log(index);
      this.activeLegIndex = index;
    });
  };

  resetMap = () => {
    runInAction(() => {
      this.layers = { ...{}, ...layers };
      this.activeLegIndex = -1;
      this.map = null;
    });
  };

  dependentTracker = {
    setSocket: socket => {
      runInAction(() => {
        this.socket = socket;
      });
    },

    start: dependent => {
      const socket = new WebSocket(
        `${config.SERVICES.websocket}?groups=dependent-${dependent}`
      );
      runInAction(() => {
        this.socket = socket;
      });

      socket.onopen = e => {
        '{trip-map-store} socket established', e;
      };

      socket.onmessage = event => {
        console.log(`{trip-map-store} data received`);
        const data = JSON.parse(JSON.parse(event.data));
        console.log('{trip-map-store} navigating', data?.navigating);
        if (!this.map) return;
        if (data?.longitude) {
          if (this.map.getSource('user')) {
            this.map.getSource('user').setData(
              featureCollection([
                feature({
                  type: 'Point',
                  coordinates: [data.longitude, data.latitude],
                }),
              ])
            );
          }
        }
        if (!data.longitude && !data.navigating) {
          this.map.getSource('user').setData(featureCollection([]));
        }
        const legIndex = data?.legIndex === 0 ? 0 : data?.legIndex || -1;
        this.setActiveLeg(legIndex);
      };

      socket.onclose = event => {
        if (event.wasClean) {
          console.log(
            `{trip-map-store} socket closed cleanly, code=${event.code} reason=${event.reason}`
          );
        } else {
          // e.g. server process killed or network down
          // event.code is usually 1006 in this case
          console.log('{trip-map-store} socket died');
        }
      };

      socket.onerror = function (error) {
        console.log(`{trip-map-store}`, error);
      };
    },

    stop: () => {
      runInAction(() => {
        if (!this.socket) return;
        this.socket.close();
        this.socket = null;
      });
    },
  };
}

const generateRoute = tripPlan => {
  var route = {
    type: 'FeatureCollection',
    features: [],
  };
  for (var i = 0; i < tripPlan.legs.length; i++) {
    var leg = tripPlan.legs[i];
    var properties = {
      lineColor: getModeColor(leg.mode),
      lineWidth: 4,
      lineOpacity: 1,
      lineJoin: 'round',
      lineDasharray: [1, 0],
      mode: leg.mode.toLowerCase(),
    };
    if (leg.mode.toLowerCase() === 'walk') {
      properties.lineDasharray = [1, 0.5];
    }
    var legGeometry = toGeoJSON(leg.legGeometry.points);
    if (legGeometry.coordinates.length === 0) {
      legGeometry.coordinates.push([leg.from.lon, leg.from.lat]);
    }
    route.features.push({
      type: 'Feature',
      geometry: legGeometry,
      properties: properties,
    });
  }
  return route;
};

const generateIntermediateStops = tripPlan => {
  var intermediateStops = {
    type: 'FeatureCollection',
    features: [],
  };
  for (var i = 0; i < tripPlan.legs.length; i++) {
    var leg = tripPlan.legs[i],
      color = getModeColor(leg.mode), //leg.routeColor,
      legGeometry = toGeoJSON(leg.legGeometry.points);
    if (leg.intermediateStops && leg.intermediateStops.length > 0) {
      for (var j = 0; j < leg.intermediateStops.length; j++) {
        var iStop = leg.intermediateStops[j];
        var pt = {
          type: 'Point',
          coordinates: [iStop.lon, iStop.lat],
        };
        var snapped = nearestPointOnLine(legGeometry, pt);
        var stopProperties = {
          circleColor: '#ffffff',
          circleRadius: 3,
          circleStrokeColor: color === '#FFFFFF' ? '#70BFDA' : color,
          circleStrokeWidth: 3,
        };
        intermediateStops.features.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [
              snapped.geometry.coordinates[0],
              snapped.geometry.coordinates[1],
            ],
          },
          properties: stopProperties,
        });
      }
    }
  }
  return intermediateStops;
};

const generateModeIconSymbols = (tripPlan, hasWheelchair) => {
  var lyrs = {
    walk: { type: 'FeatureCollection', features: [] },
    roll: { type: 'FeatureCollection', features: [] },
    car: { type: 'FeatureCollection', features: [] },
    bike: { type: 'FeatureCollection', features: [] },
    bus: { type: 'FeatureCollection', features: [] },
    tram: { type: 'FeatureCollection', features: [] },
    destination: { type: 'FeatureCollection', features: [] },
  };

  const modeIconData = featureCollection([]);

  for (var i = 0; i < tripPlan.legs.length; i++) {
    var leg = tripPlan.legs[i],
      mode = leg.mode,
      ftr = leg.from;

    switch (mode.toLowerCase()) {
      case 'walk':
        // don't show a walk icon if we're going less than 1/10 mi
        if (leg.distance > 161) {
          const _mode = hasWheelchair ? 'roll' : mode.toLowerCase();
          modeIconData.features.push({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [ftr.lon, ftr.lat] },
            properties: {
              mode: _mode,
              icon: `mode-${_mode}`,
            },
          });
        }
        break;
      default:
        const _mode =
          mode.toLowerCase() === 'bicycle' ? 'bike' :
            mode.toLowerCase() === 'hail' ? 'shuttle' :
              mode.toLowerCase();
        console.log('MODE', _mode);
        modeIconData.features.push({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [ftr.lon, ftr.lat] },
          properties: {
            mode: _mode.toLowerCase(),
            icon: `mode-${_mode.toLowerCase()}`,
          },
        });
    }
  }
  var lastLeg = tripPlan.legs[tripPlan.legs.length - 1];
  modeIconData.features.push({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [lastLeg.to.lon, lastLeg.to.lat] },
    properties: {
      mode: 'destination',
      icon: 'destination',
    },
  });
  // console.log({ modeIconData });
  return modeIconData;
};

const getModeColor = mode => {
  let color = '#616161';
  const found = config.MODES.find(
    m => m.mode.toLowerCase() === mode.toLowerCase()
  );
  return found.color || color;
};

export default TripMapStore;
