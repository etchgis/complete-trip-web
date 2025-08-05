import { Box, useColorMode } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';

import bbox from '@turf/bbox';
import config from '../../config';
import { mapControls } from '../Map/mapboxControls.js';
import mapboxgl from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { observer } from 'mobx-react-lite';
import { theme } from '../../theme';
import { toJS } from 'mobx';
import { useStore } from '../../context/RootStore';

export const TripPlanMap = observer(({ tripPlan, caregiver }) => {
  const mapRef = useRef(null);
  const mapContainer = useRef(null);
  const { colorMode } = useColorMode();
  const mapStyle = colorMode === 'light' ? 'DAY' : 'NIGHT';
  const {
    map: tripMapStoreMap,
    setMap: setTripMapStoreMap,
    setData,
  } = useStore().tripMapStore;
  const { ux } = useStore().uiStore;

  /*
  TODO METHOD TO UPDATE COLOR OF TRIP PATH WHEN DATA RECEIVED FROM WEB SOCKET
  TODO make a layers object in either tripPlanMapStore or another store or config
  TODO match language of mobile vertical trip plan
  TODO make trip plan show up when clicked from the trip list
  */

  useEffect(() => {
    if (mapRef?.current) {
      console.log('mapRef.current exists');
      return;
    }

    console.log({ tripPlan });
    const __data = setData(tripPlan);
    // console.log(toJS(__data.stops));
    // console.log(toJS(__data.modeIcons));
    // console.log(toJS(__data.route));

    // const popup = new mapboxgl.Popup();
    // const fs = new mapboxgl.FullscreenControl();

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: config.MAP.BASEMAPS[mapStyle],
      center: [config.MAP.CENTER[1], config.MAP.CENTER[0]],
      zoom: 10,
    })
      .addControl(mapControls.nav, 'bottom-right')
      // .addControl(mapControls.locate, 'bottom-right')
      // .addControl(mapControls.fullscreen, 'bottom-right')
      // .addControl(fs, 'bottom-right')
      .on('load', initMap)
      .on('style.load', () => {
        console.log('[trip-map] style loaded');
        // console.log(e.target.getStyle());
      })
      .on('contextmenu', e => {
        console.log(e.target.getZoom());
        console.log(e.lngLat);
      });

    //TODO move this all to the TripMapStore?
    function initMap(e) {
      const map = e.target || e;
      setTripMapStoreMap(map);
      map.resize();
      if (!map.getSource('route')) {
        map.addSource('route', {
          type: 'geojson',
          data: __data.route,
        });
        map.addSource('stops', {
          type: 'geojson',
          data: __data.stops,
        });
        map.addSource('mode-icons', {
          type: 'geojson',
          data: __data.modeIcons,
        });
        map.addSource('user', {
          type: 'geojson',
          data: __data.user,
        });
      }
      map.addLayer({
        id: 'route-case',
        type: 'line',
        source: 'route',
        paint: {
          'line-color': 'white',
          'line-width':
            __data?.route?.features[0]?.properties?.lineWidth || 4 + 2,
        },
      });
      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        paint: {
          'line-color': ['get', 'lineColor'],
          'line-width': ['get', 'lineWidth'],
          'line-opacity': ['get', 'lineOpacity'],
          'line-dasharray': ['get', 'lineDasharray'],
        },
      });
      map.addLayer({
        id: 'stops',
        type: 'circle',
        source: 'stops',
        paint: {
          'circle-radius': ['get', 'circleRadius'],
          'circle-color': ['get', 'circleColor'],
          'circle-stroke-color': ['get', 'circleStrokeColor'],
          'circle-stroke-width': ['get', 'circleStrokeWidth'],
        },
      });
      map.addLayer({
        id: 'mode-icons',
        type: 'symbol',
        source: 'mode-icons',
        layout: {
          'icon-image': ['get', 'icon'],
          'icon-size': 0.8,
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
          // 'icon-offset': ['get', 'offset'],
        },
      });
      map.addLayer({
        id: 'user',
        type: 'circle',
        source: 'user',
        paint: {
          'circle-radius': 8,
          'circle-stroke-width': 4,
          'circle-stroke-color': theme.colors.brand,
          'circle-color': 'white',
        },
      });

      map.fitBounds(bbox(__data.route), { padding: 50 });
      // map.removeControl(fs);
      // map.addControl(fs, 'bottom-right');
    }

    //eslint-disable-next-line
  }, []);

  const kioskTopHeight = 700;
  const kioskBottomHeight = 255;
  // const kioskMiddleHeight = 1920 - kioskTopHeight - kioskBottomHeight;
  const headerHeight = 60;

  return <Box
    id="trip-plan-map"
    ref={mapContainer}
    style={{ flex: 1 }}
    h={ux === 'kiosk' ? `calc(100vh - ${kioskTopHeight + kioskBottomHeight + headerHeight}px)` : ''}
  />;
});
