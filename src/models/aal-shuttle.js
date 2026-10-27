/**
 * Pure helpers that turn the All Access Loop (AAL) route and vehicle
 * responses into GeoJSON the map can draw.
 */

// The feed has no list of vehicles, so these are the ids the rider app polls.
export const AAL_VEHICLE_IDS = ['0'];

const DEFAULT_ROUTE_COLOR = '005bbb';
const DEFAULT_OUTLINE_COLOR = 'ffffff';

const isCoordinate = value =>
  Array.isArray(value) &&
  value.length >= 2 &&
  Number.isFinite(Number(value[0])) &&
  Number.isFinite(Number(value[1]));

/**
 * Read the first pattern of the first route into a line and its stops.
 *
 * @param {object} json the routes feed body
 * @returns {{route: object, stops: object}|null} GeoJSON feature collections,
 *   or null when there is no pattern with coordinates
 */
export function readAalRoute(json) {
  const routeInfo = json?.routes?.[0];
  const pattern = routeInfo?.patterns?.[0];
  const coordinates = pattern?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length === 0) return null;

  const routeColor = `#${routeInfo.color || DEFAULT_ROUTE_COLOR}`;
  const outlineColor = `#${routeInfo.textColor || DEFAULT_OUTLINE_COLOR}`;

  const route = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { name: routeInfo.longName, routeColor, outlineColor },
        geometry: { type: 'LineString', coordinates },
      },
    ],
  };

  const stops = {
    type: 'FeatureCollection',
    features: (pattern.stops || [])
      .filter(stop => isCoordinate(stop?.coordinates))
      .map(stop => ({
        type: 'Feature',
        properties: {
          id: stop.stopId,
          name: stop.name,
          publicCode: stop.publicCode,
          routeColor,
          outlineColor,
        },
        geometry: { type: 'Point', coordinates: stop.coordinates },
      })),
  };

  return { route, stops };
}

/**
 * Read a vehicle position (GTFS-RT JSON) into a plain object.
 *
 * @param {object} json the vehicle position body; empty when nothing is running
 * @param {string} [requestedId] used as the vehicle id when the body has none
 * @returns {{vehicleId: string, coordinates: number[], heading: number|null,
 *   timestampMs: number|null}|null} null when there is no usable position
 */
export function readAalVehicle(json, requestedId) {
  const vehicle = json?.entity?.[0]?.vehicle;
  const position = vehicle?.position;
  if (!position) return null;

  const latitude = Number(position.latitude);
  const longitude = Number(position.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude === 0 && longitude === 0) return null;

  const bearing = Number(position.bearing);
  const timestamp = Number(vehicle.timestamp);

  return {
    vehicleId: vehicle.vehicle?.id ?? requestedId ?? 'unknown',
    coordinates: [longitude, latitude],
    heading: Number.isFinite(bearing) ? bearing : null,
    timestampMs: Number.isFinite(timestamp) ? timestamp * 1000 : null,
  };
}

/**
 * @param {Array<object|null>} vehicles results of readAalVehicle
 * @returns {object} a feature collection with one point per vehicle
 */
export function toAalVehicleFeatures(vehicles) {
  return {
    type: 'FeatureCollection',
    features: (vehicles || []).filter(Boolean).map(vehicle => ({
      type: 'Feature',
      properties: {
        vehicleId: vehicle.vehicleId,
        icon: 'bus-live',
        heading: vehicle.heading,
      },
      geometry: { type: 'Point', coordinates: vehicle.coordinates },
    })),
  };
}
