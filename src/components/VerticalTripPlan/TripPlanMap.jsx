import * as polyline from '@mapbox/polyline';

import { Box, useColorMode } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';

import bbox from '@turf/bbox';
import config from '../../config';
import { fillGaps } from '../../utils/tripplan';
import { mapControls } from '../Map/mapboxControls.js';
import mapboxgl from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';

export const TripPlanMap = observer(({ tripPlan }) => {
  const mapRef = useRef(null);
  const mapContainer = useRef(null);
  const { colorMode } = useColorMode();
  const mapStyle = colorMode === 'light' ? 'DAY' : 'NIGHT';

  const planLegs = fillGaps(toJS(tripPlan.legs));
  console.log(planLegs);
  const geojson = {
    type: 'FeatureCollection',
    features: [],
  };
  const colors = [
    '#00205b',
    '#02597E',
    '#0079C2',
    '#0099E6',
    '#00BFFF',
    '#00CCFF',
    '#00E5FF',
    '#00FFFF',
    '#1AFFFF',
    '#33FFFF',
    '#4DFFFF',
    '#66FFFF',
    '#80FFFF',
    '#99FFFF',
    '#B3FFFF',
    '#CCFFFF',
    '#E5FFFF',
    '#FFFFFF',
  ];
  planLegs.forEach((v, i) =>
    v?.legGeometry?.points
      ? geojson.features.push({
          type: 'Feature',
          properties: { ...v, stroke: colors[i] },
          geometry: polyline.toGeoJSON(v?.legGeometry?.points),
        })
      : null
  );

  /*
  TODO METHOD TO UPDATE COLOR OF TRIP PATH WHEN DATA RECEIVED FROM WEB SOCKET
  TODO METHOD TO DRAW TRIP PATH WHEN DATA RECEIVED FROM WEB SOCKET
  TODO ADD ICONS FOR INT STOPS
  */

  useEffect(() => {
    if (!geojson) return;
    if (mapRef?.current) return updateTripPath(mapRef.current);

    const popup = new mapboxgl.Popup();
    const fs = new mapboxgl.FullscreenControl();

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: config.MAP.BASEMAPS[mapStyle],
      center: [config.MAP.CENTER[1], config.MAP.CENTER[0]],
      zoom: 10,
    })
      .addControl(mapControls.nav, 'bottom-right')
      .addControl(mapControls.locate, 'bottom-right')
      // .addControl(mapControls.fullscreen, 'bottom-right')
      .addControl(fs, 'bottom-right')
      .on('load', updateTripPath)
      .on('style.load', e => {
        console.log('style loaded');
      })
      .on('contextmenu', e => {
        console.log(e.target.getZoom());
        console.log(e.lngLat);
      })
      .on('click', addPopups);

    function updateTripPath(e) {
      const map = e.target || e;
      map.resize();
      if (!map.getSource('trip')) {
        map.addSource('trip', {
          type: 'geojson',
          data: geojson,
        });
      } else {
        map.getSource('trip').setData(geojson);
      }
      // if (map.getLayer('trip')) map.removeLayer('trip');
      // if (map.getLayer('trip-case')) map.removeLayer('trip-case');
      if (!map.getLayer('trip-case')) {
        map.addLayer({
          id: 'trip-case',
          type: 'line',
          source: 'trip',
          paint: {
            'line-color': 'white',
            'line-width': 6,
          },
        });
        map.addLayer({
          id: 'trip',
          type: 'line',
          source: 'trip',
          paint: {
            'line-color': ['get', 'stroke'],
            'line-width': 4,
          },
        });
      }
      map.fitBounds(bbox(geojson), { padding: 50 });
      map.removeControl(fs);
      map.addControl(fs, 'bottom-right');
    }

    function addPopups(e) {
      const map = e.target || e;
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['trip', 'trip-case'],
      });
      if (!features.length) return;
      popup.remove();
      setTimeout(() => {
        popup.setLngLat(e.lngLat);
        const html = Object.keys(features[0].properties)
          .map(key => {
            return `<div><strong>${key}</strong>: ${features[0].properties[key]}</div>`;
          })
          .join('');
        popup.setHTML(html);
        popup.addTo(map);
      }, 0);
    }

    //eslint-disable-next-line
  }, [colorMode]);

  return <Box id="trip-plan-map" ref={mapContainer} style={{ flex: 1 }} />;
});
