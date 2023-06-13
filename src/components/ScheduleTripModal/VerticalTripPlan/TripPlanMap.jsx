import { Box, useColorMode } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';

import bbox from '@turf/bbox';
import config from '../../../config';
import { mapControls } from '../../Map/mapboxControls.js';
import mapboxgl from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { observer } from 'mobx-react-lite';

export const TripPlanMap = observer(({ geojson }) => {
  const mapRef = useRef(null);
  const mapContainer = useRef(null);
  const { colorMode } = useColorMode();
  const mapStyle = colorMode === 'light' ? 'DAY' : 'NIGHT';
  console.log({ geojson });

  useEffect(() => {
    if (!geojson) return;
    if (mapRef?.current) return addTripPath(mapRef.current);

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
      .on('load', addTripPath)
      .on('style.load', e => {
        console.log('style loaded');
      })
      .on('contextmenu', e => {
        console.log(e.target.getZoom());
        console.log(e.lngLat);
      });

    function addTripPath(e) {
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
      if (map.getLayer('trip')) map.removeLayer('trip');
      if (map.getLayer('trip-case')) map.removeLayer('trip-case');

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
          'line-color': geojson.properties.stroke,
          'line-width': 4,
        },
      });
      map.fitBounds(bbox(geojson), { padding: 50 });
      map.removeControl(fs);
      map.addControl(fs, 'bottom-right');
    }

    //eslint-disable-next-line
  }, [colorMode]);

  return <Box ref={mapContainer} style={{ flex: 1 }} borderRadius={'lg'} />;
});
