import 'mapbox-gl/dist/mapbox-gl.css';

import { Box, Flex, } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

import Loader from '../Loader';
import config from '../../config';
import debounce from '../../utils/debounce';
import { getLocation } from '../../utils/getLocation';
import { mapControls } from './mapboxControls.js';
import { mapLayers } from './mapLayers';
// import { mapListeners } from './mapListeners';
import mapboxgl from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { observer } from 'mobx-react-lite';
import { useLocation } from 'react-router-dom';
import { useStore } from '../../context/RootStore';

// import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

// import { useColorMode } from '@chakra-ui/react';

mapboxgl.accessToken = config.MAP.MAPBOX_TOKEN;

export const MapComponent = observer(({ showMap, getRouteList }) => {
  console.log('[map-view] rendering');
  const { pathname } = useLocation();
  const {
    setMap,
    mapStyle,
    mapCache,
    setMapState,
  } = useStore().mapStore;
  const mapRef = useRef(null);
  const mapContainer = useRef(null);
  const [mapIsLoaded, setMapIsLoaded] = useState(
    mapRef?.current ? true : false
  );

  window.addEventListener('resize', () => {
    if (mapRef?.current) mapRef.current.resize();
  });

  useEffect(() => {
    if (mapRef?.current && showMap) mapRef.current.resize();

    if (mapRef?.current && mapIsLoaded) {
      const style = mapRef.current.getStyle();
      mapRef.current.resize();
      if (mapStyle === 'DAY' && style.name === 'Rural Mobility Navigation Day')
        return;
      if (
        mapStyle === 'NIGHT' &&
        style.name === 'Rural Mobility Navigation Night'
      )
        return;
      mapLayers(mapRef.current);
      mapRef.current.setStyle(config.MAP.BASEMAPS[mapStyle]);
      return;
    }

    //TODO move to a listeners file
    mapControls.locate.on('geolocate', e => {
      const { latitude, longitude } = e.coords;
      console.log({ latitude, longitude });
      getRouteList(mapRef.current, latitude, longitude);
    });

    (async () => {
      const userLocation = await getLocation();
      const center = userLocation?.center || [
        config.MAP.CENTER[1],
        config.MAP.CENTER[0],
      ];

      if (!mapRef?.current) {

        const markerEl = document.createElement('div');
        markerEl.className = 'mapboxgl-user-location-dot current-stop';
        const marker = new mapboxgl.Marker({
          element: markerEl,
        });

        setMapState('marker', marker);

        try {
          mapRef.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: config.MAP.BASEMAPS[mapStyle], //change to style from store
            center: center,
            zoom: 16,
          })
            .addControl(mapControls.nav, 'top-right')
            .addControl(mapControls.locate, 'top-right')
            // .addControl(mapControls.bookmarks, 'top-right')
            .on('load', initMap)
            .on('style.load', mapLayers)
            .on('moveend', e => {
              debounce(getRouteList(e.target), 1000);
            })
            .on('contextmenu', e => {
              console.log(e.target.getZoom());
              console.log(e.lngLat);
            });
        } catch (error) {
          console.log(error);
        }


      }
    })();

    function initMap() {
      const map = this;
      setMap(map)
      // mapControls.locate.trigger();
      setMapIsLoaded(true);
      // mapListeners(map, setMapIsLoaded);
    }

    //eslint-disable-next-line
  }, [mapStyle, pathname, mapCache.stops]);

  return (
    <Flex
      flex={1}
      display={showMap ? 'flex' : 'none'}
      flexDir={'row'}
      id="map-component"
      height={'calc(100vh - 60px)'}
      overflow={'hidden'}
    >
      <Box
        ref={mapContainer}
        className="mapbox"
        style={{ height: '100%', flex: 1 }}
        id="map-container"
      />

      {/* NOTE only show loader when map is actually open */}
      <Loader
        isOpen={!mapIsLoaded && pathname === '/map'}
      ></Loader>
    </Flex>
  );
});