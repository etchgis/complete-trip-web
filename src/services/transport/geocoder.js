import distance from '@turf/distance';
import { point } from '@turf/helpers';
// import geolocation from '../../models/geolocation';

const NBR_RESULTS = 10;

/**
 * Call when the search API fails.
 * @param {Error} error
 */
// eslint-disable-next-line no-unused-vars
function networkError(error) {
  // TODO: If we are not already using Mapbox, switch to it
  // for a while, and try our own later.
  // console.error(error.message);
}

function calcDistance(lng1, lat1, lng2, lat2) {
  const miles = distance(point([lng1, lat1]), point([lng2, lat2]), {
    units: 'miles',
  });
  if (miles < 0.25) {
    return `${Math.round(miles * 5280)} ft`;
  }
  return `${Math.round(miles * 10) / 10} mi`;
}

function processForwardResults(results, center) {
  const formatted = [];
  results.forEach(item => {
    formatted.push({
      title: item.title,
      description:
        item.description === 'No details available.' ? null : item.description, // TEMP!
      distance: center
        ? calcDistance(item.point.lng, item.point.lat, center.lng, center.lat)
        : null,
      point: item.point,
    });
  });
  return formatted;
}

function runForwardQuery(params) {
  // TODO: make prefs a Promise
  // const language = prefs.get().language;
  // https://mmapi.etch.app/geocode?query=
  let uri = `https://511ny.etch.app/geocode?query=${encodeURIComponent(
    params.query
  )}`;
  // if (language !== 'en')
  //  uri += `&language=${language}`;
  uri += `&limit=${NBR_RESULTS}`;
  if (params.center) {
    uri += `&center=${(params.center.lng * 1000 || 0) / 1000},${
      (params.center.lat * 1000 || 0) / 1000
    }`;
  }
  return fetch(uri)
    .then(response => {
      if (response.status === 200) {
        return response.json();
      }
      throw Error(`Server returned status code ${response.status}`);
    })
    .then(results => processForwardResults(results, params.center))
    .catch(err => {
      networkError(err);
    });
}

function processReverseResults(result, pt) {
  const formatted = [];
  if (result.length > 0) {
    const item = result[0];
    formatted.push({
      title: item.title,
      description:
        result.description === 'No details available.'
          ? null
          : item.description, // TEMP!
      distance: 0,
      point: pt, // item.point
    });
  }
  return formatted;
}

function runReverseQuery(pt) {
  const uri = `https://511ny.etch.app/geocode?query=${pt.lng},${pt.lat}&limit=1`;
  return fetch(uri)
    .then(response => {
      if (response.status === 200) {
        return response.json();
      }
      throw Error(`Server returned status code ${response.status}`);
    })
    .then(results => processReverseResults(results, pt))
    .catch(err => {
      networkError(err);
    });
}

const geocode = {
  /**
   * Do a geocode of the given string.
   * @param {string} query
   * @param {json} center
   * @returns {Promise}
   */
  forward: (query, center) => {
    if (!query || !query.trim()) {
      return Promise.resolve([]);
    }
    // if (!center && geolocation.lastPoint) {
    //   // eslint-disable-next-line no-param-reassign
    //   center = {
    //     lng: geolocation.lastPoint.lng,
    //     lat: geolocation.lastPoint.lat,
    //   };
    // }

    return runForwardQuery({ query, center });
  },

  /**
   * Reverse geocode of the given point
   * @param {json} point
   * @returns {Promise}
   */
  reverse: pt => runReverseQuery(pt),
};

export default geocode;