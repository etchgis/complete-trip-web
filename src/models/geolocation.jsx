/**
 * Responsible for acquiring the user's GPS location.
 * Each subscriber states the desired accuracy level. The GPS circuitry will run at the
 * level needed for the current most demanding subscriber. This is updated whenever
 * subscribers are added or removed.
 * @module geolocator
 */

import { NativeEventEmitter, NativeModules } from 'react-native';

const { Geolocation } = NativeModules;

const geolocation = {

  /** Quality levels */
  Quality: {
    AREA: 1, // update for significant area changes
    DYNAMIC: 2, // update speed depends on movement speed
    BEST: 3, // always use best result available
  },

  quality: 0, // default to 0 = GPS is not on

  /** True when pause() has been called */
  isPaused: false,

  /** Provides the last point that was retrieved. {lat, lng} */
  lastPoint: null,

  /** Provides the last heading that was retrieved. 0 = north, 90 = east */
  lastHeading: null,

  /** Provides the last speed that was retrieved. This is instantaneous speed in meters/sec */
  lastSpeed: null,

  /** True if user permission granted, false if denied, null if unknown. */
  // hasPermission: null,

  _locationSubscribers: [],
  _geofenceSubscribers: [],
  _pointWaiters: [],

  init: () => {
    geolocation._geoEventEmitter = new NativeEventEmitter(Geolocation);
    geolocation._nativeLocationSub = geolocation._geoEventEmitter.addListener('UpdateLocation', onLocationUpdate);
    geolocation._nativeHeadingSub = geolocation._geoEventEmitter.addListener('UpdateHeading', onHeadingUpdate);
    geolocation._nativeErrorSub = geolocation._geoEventEmitter.addListener('LocationError', onLocationError);
    geolocation._nativeGeofenceSub = geolocation._geoEventEmitter.addListener('GeofenceEvent', onGeofenceEvent);
    geolocation.quality = 1; // on, but default quality
    Geolocation.start();
    geolocation.updateQuality();
  },
  shutdown: () => {
    if (geolocation._nativeLocationSub) {
      geolocation._nativeLocationSub.remove();
      geolocation._nativeHeadingSub.remove();
      geolocation._nativeErrorSub.remove();
      geolocation._nativeGeofenceSub.remove();
      geolocation._nativeLocationSub = null;
      geolocation._nativeHeadingSub = null;
      geolocation._nativeGeofenceSub = null;
      geolocation._nativeErrorSub = null;
    }
  },

  /**
    * Get next available GPS position.
    * @returns {Promise} Resolves to { lat, lng } or generates PositionError.
    */
  getPoint: () => new Promise((resolve) => {
    if (geolocation.lastPoint) {
      // TODO: cache this for some amount of time.
      resolve(geolocation.lastPoint);
    } else {
      geolocation._pointWaiters.push(resolve);
    }
  }),
  // return getPermission().then(granted => {
  //  if (geolocation.lastPoint) {
  //    // TODO: cache this for some amount of time.
  //    return geolocation.lastPoint;
  //  }
  //  return new Promise((resolve, reject)  => {
  //    var options;
  //    if (Platform.OS === 'ios') {
  //      options = { enableHighAccuracy: true };
  //    }
  //    Geolocation.getCurrentPosition(position => {
  //      geolocation.lastPoint = fromNavigatorPos(position);
  //      resolve(geolocation.lastPoint);
  //    }, reject, options/*, { timeout: 0, enableHighAccuracy: true }*//*)
  //  })
  // })

  /**
    * Subscribe to changes in the user's position. Call
    * @param {Function} fn - Callback for receiving each position.
    * @param {Function} errFn - Called as errors occur, receives PositionError.
    * @returns {Object} A value to pass to `cancel` function.
    */
  // subscribe: (fn, errFn) => {
  //  return getPermission().then(granted => {
  //    if (granted) {
  //      var options;
  //      if (Platform.OS === 'ios') {
  //        options = { enableHighAccuracy: true };
  //      }
  //      return Geolocation.watchPosition(position => {
  //        const pt = fromNavigatorPos(position);
  //        if (pt.lat && pt.lng) {
  //          geolocation.lastPoint = pt;
  //          geolocation.lastHeading = position.coords.heading;
  //          geolocation.lastSpeed = position.coords.speed;
  //          fn(geolocation.lastPoint, geolocation.lastHeading, geolocation.lastSpeed);
  //        }
  //      }, errFn, options/*, { timeout: 0, enableHighAccuracy: true }*/)
  //    }
  //  })
  //  .catch(errFn)
  // },

  /**
    * Subscribe to changes in the user's position. Call `cancel` when done subscribing.
    * @param {Function} fn - Callback for receiving each position.
    * @param {Function} errFn - Called as errors occur, optional.
    * @param {String} quality - One of the geolocation.Quality values, optional.
    * @returns {Object} A watcher object with the `cancel` function.
    */
  subscribe: (fn, errFn, quality) => {
    const subscriber = {
      fn,
      cancel: () => {
        const index = geolocation._locationSubscribers.indexOf(subscriber);
        if (index !== -1) {
          geolocation._locationSubscribers.splice(index, 1);
          geolocation.updateQuality();
        }
      },
    };
    let qualityValue = quality || 1;
    if (errFn && errFn instanceof Function) {
      subscriber.errFn = errFn;
    } else {
      qualityValue = errFn || 1;
    }
    subscriber.quality = qualityValue;
    geolocation._locationSubscribers.push(subscriber);
    geolocation.updateQuality();

    // Always give them the latest point
    if (geolocation.lastPoint) {
      fn(geolocation.lastPoint, geolocation.lastHeading, geolocation.lastSpeed);
    }

    return subscriber;
  },

  /**
    * Subscribe to the user's geofence enter or exit events. Call `cancel` when done subscribing.
    * @param {Function} fn - Callback for receiving each event.
    * @param {Function} errFn - Called as errors occur.
    * @returns {Object} A watcher object with the `cancel` function.
    */
  subscribeToGeofences: (fn, errFn) => {
    const subscriber = {
      fn,
      errFn,
      cancel: () => {
        const index = geolocation._geofenceSubscribers.indexOf(subscriber);
        if (index !== -1) {
          geolocation._geofenceSubscribers.splice(index, 1);
        }
      },
    };
    geolocation._geofenceSubscribers.push(subscriber);

    // TODO: should we do send the latest event that occurred in less than 1 second?
    // What if the app is launched because of a geofence event
    // but a handler hasn't been set yet?
  },

  /**
    * Register a geofence to background wake the app.
    */
  addGeofence: (lat, lng, radius, name) => {
    Geolocation.addGeofence(lat, lng, radius, name);
  },

  /**
    * Wipe all fences set.
    */
  clearGeofences: () => {
    Geolocation.clearGeofences();
  },

  /**
    * Check for the minimum required quality level of all subscribers and
    * upgrade or downgrade as needed.
    */
  updateQuality: () => {
    if (geolocation.quality === 0) {
      return; // not running yet.
    }
    let minQuality = 1; // ensure it's always on (at least 1)
    geolocation._locationSubscribers.forEach((subscriber) => {
      if (subscriber.quality > minQuality) {
        minQuality = subscriber.quality;
      }
    });

    if (minQuality > 0 && minQuality !== geolocation.quality) {
      // upgrade or downgrade GPS requirement.
      console.log(`Switching GPS quality level from ${geolocation.quality} to ${minQuality}`);
      Geolocation.setAccuracy(minQuality);
      geolocation.quality = minQuality;
    }
  },

  /**
    * Stop receiving realtime location updates.
    * Simulated coordinates will still be received.
    */
  pause: () => {
    if (!geolocation.isPaused) {
      Geolocation.pause();
      geolocation.isPaused = true;
    }
  },

  /**
    * Restore realtime location updates, overriding any simulated location.
    */
  resume: () => {
    if (geolocation.isPaused) {
      Geolocation.resume();
      geolocation.isPaused = false;
    }
  },

  /**
    * Feed in simulated GPS data.
    */
  setLocation: (point, heading, speed) => {
    geolocation.pause();
    Geolocation.simulate(point.lat, point.lng, heading, speed);
  },

};

function onLocationUpdate(evt) {
  // console.log(JSON.stringify(evt));
  const pt = {
    lat: evt.lat,
    lng: evt.lng,
  };
  if (pt.lat && pt.lng) {
    geolocation.lastPoint = pt;
    geolocation.lastHeading = evt.heading;
    geolocation.lastSpeed = evt.speed;
    geolocation._locationSubscribers.forEach((subscriber) => {
      subscriber.fn(geolocation.lastPoint, geolocation.lastHeading, geolocation.lastSpeed);
    });
    geolocation._pointWaiters.forEach((waiter) => {
      waiter(geolocation.lastPoint);
    });
    geolocation._pointWaiters.length = 0;
  }
}

function onHeadingUpdate(/* evt */) {
  // TODO: heading messages are too frequent. Provide a separate subscription
  // for those events?
  // console.log(JSON.stringify(evt));
  /*
   geolocation.lastHeading = evt.heading;
   if (!geolocation.lastPoint) return;
   geolocation._locationSubscribers.forEach((subscriber) => {
     subscriber.fn(geolocation.lastPoint, geolocation.lastHeading, geolocation.lastSpeed);
   });
   */
}

function onLocationError(evt) {
  geolocation._locationSubscribers.forEach((subscriber) => {
    if (subscriber.errFn) {
      subscriber.errFn(evt.msg);
    }
  });
}

function onGeofenceEvent(evt) {
  console.log(`Got geofence message: ${JSON.stringify(evt)}`);
  geolocation._geofenceSubscribers.forEach((subscriber) => {
    subscriber.fn(evt.name, evt.didEnter);
  });
}

/**
  * Convert HTML5 Navigator position to { lat, lng } object.
  * @returns {Object} The lat and lng of the position.
  */
// function fromNavigatorPos(p) {
//  return {
//    lat: p.coords.latitude,
//    lng: p.coords.longitude
//  }
// }

/**
  * Get user permission. Necessary for Android.
  * @returns Promise
  */
// function getPermission() {
//  if(Platform.OS !== 'android'){
//    geolocation.hasPermission = true;
//  }

//  if (geolocation.hasPermission !== null) {
//    return Promise.resolve(geolocation.hasPermission);
//  }

//  return PermissionsAndroid.request(
//      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
//          'title': 'Location Access Required',
//          'message': 'Your location is requested to provide navigation.'
//      }
//  ).then((granted) => {
//    geolocation.hasPermission = granted === PermissionsAndroid.RESULTS.GRANTED;
//    return geolocation.hasPermission;
//  })
// }

export default geolocation;
