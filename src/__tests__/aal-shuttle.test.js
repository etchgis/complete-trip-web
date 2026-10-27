import { describe, expect, test } from 'vitest';

import {
  AAL_VEHICLE_IDS,
  readAalRoute,
  readAalVehicle,
  toAalVehicleFeatures,
} from '../models/aal-shuttle';

const routeBody = (routeOverrides = {}, stops) => ({
  routes: [
    {
      id: 'r1',
      longName: 'All Access Loop',
      color: '005bbf',
      textColor: 'FFFFFF',
      patterns: [
        {
          coordinates: [
            [-78.86, 42.89],
            [-78.85, 42.9],
          ],
          stops: stops || [
            {
              stopId: 's1',
              name: 'Main',
              publicCode: '101',
              coordinates: [-78.86, 42.89],
            },
          ],
        },
      ],
      ...routeOverrides,
    },
  ],
});

const vehicleBody = (vehicle = {}) => ({
  entity: [
    {
      vehicle: {
        vehicle: { id: 'v1' },
        position: { latitude: 42.89, longitude: -78.86, bearing: 90, speed: 3 },
        timestamp: 1757600000,
        ...vehicle,
      },
    },
  ],
});

describe('AAL_VEHICLE_IDS', () => {
  test('lists the ids the rider app polls', () => {
    expect(AAL_VEHICLE_IDS).toEqual(['0']);
  });
});

describe('readAalRoute', () => {
  test('builds the line and stops with colors', () => {
    const { route, stops } = readAalRoute(routeBody());
    expect(route.features).toHaveLength(1);
    expect(route.features[0].geometry.type).toBe('LineString');
    expect(route.features[0].properties).toEqual({
      name: 'All Access Loop',
      routeColor: '#005bbf',
      outlineColor: '#FFFFFF',
    });
    expect(stops.features[0].geometry).toEqual({
      type: 'Point',
      coordinates: [-78.86, 42.89],
    });
    expect(stops.features[0].properties).toEqual({
      id: 's1',
      name: 'Main',
      publicCode: '101',
      routeColor: '#005bbf',
      outlineColor: '#FFFFFF',
    });
  });

  test('falls back to default colors', () => {
    const { route } = readAalRoute(routeBody({ color: '', textColor: undefined }));
    expect(route.features[0].properties.routeColor).toBe('#005bbb');
    expect(route.features[0].properties.outlineColor).toBe('#ffffff');
  });

  test('skips stops without finite coordinates', () => {
    const { stops } = readAalRoute(
      routeBody({}, [
        { stopId: 'a', coordinates: [-78.8, 42.8] },
        { stopId: 'b' },
        { stopId: 'c', coordinates: [NaN, 1] },
      ])
    );
    expect(stops.features.map(f => f.properties.id)).toEqual(['a']);
  });

  test('returns null for an empty body or missing pattern', () => {
    expect(readAalRoute({})).toBeNull();
    expect(readAalRoute(null)).toBeNull();
    expect(readAalRoute({ routes: [{ patterns: [] }] })).toBeNull();
  });

  test('returns null when the pattern has no coordinates', () => {
    expect(readAalRoute({ routes: [{ patterns: [{ coordinates: [] }] }] })).toBeNull();
    expect(readAalRoute({ routes: [{ patterns: [{}] }] })).toBeNull();
  });
});

describe('readAalVehicle', () => {
  test('reads a position', () => {
    expect(readAalVehicle(vehicleBody())).toEqual({
      vehicleId: 'v1',
      coordinates: [-78.86, 42.89],
      heading: 90,
      timestampMs: 1757600000000,
    });
  });

  test('returns null when nothing is running', () => {
    expect(readAalVehicle({})).toBeNull();
  });

  test('returns null for 0,0 and non-numeric coordinates', () => {
    expect(
      readAalVehicle(vehicleBody({ position: { latitude: 0, longitude: 0 } }))
    ).toBeNull();
    expect(
      readAalVehicle(vehicleBody({ position: { latitude: 'x', longitude: 1 } }))
    ).toBeNull();
  });

  test('accepts string numbers', () => {
    const vehicle = readAalVehicle(
      vehicleBody({
        position: { latitude: '42.5', longitude: '-78.5', bearing: '180' },
        timestamp: '100',
      })
    );
    expect(vehicle.coordinates).toEqual([-78.5, 42.5]);
    expect(vehicle.heading).toBe(180);
    expect(vehicle.timestampMs).toBe(100000);
  });

  test('uses null heading and time when missing', () => {
    const vehicle = readAalVehicle(
      vehicleBody({
        position: { latitude: 42.5, longitude: -78.5 },
        timestamp: undefined,
      })
    );
    expect(vehicle.heading).toBeNull();
    expect(vehicle.timestampMs).toBeNull();
  });

  test('falls back to the requested id, then unknown', () => {
    const body = vehicleBody({ vehicle: undefined });
    expect(readAalVehicle(body, '0').vehicleId).toBe('0');
    expect(readAalVehicle(body).vehicleId).toBe('unknown');
  });
});

describe('toAalVehicleFeatures', () => {
  test('makes one point per vehicle and skips nulls', () => {
    const a = readAalVehicle(vehicleBody());
    const b = readAalVehicle(vehicleBody({ vehicle: { id: 'v2' } }));
    const collection = toAalVehicleFeatures([a, null, b]);
    expect(collection.type).toBe('FeatureCollection');
    expect(collection.features).toHaveLength(2);
    expect(collection.features[0].properties).toEqual({
      vehicleId: 'v1',
      icon: 'bus-live',
      heading: 90,
    });
    expect(collection.features[1].properties.vehicleId).toBe('v2');
  });

  test('is empty for no vehicles', () => {
    expect(toAalVehicleFeatures([null]).features).toEqual([]);
  });
});
