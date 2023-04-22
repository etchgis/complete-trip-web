import 'mapbox-gl/dist/mapbox-gl.css';

import { useEffect, useRef, useState } from 'react';

import { Box } from '@chakra-ui/react';
import Loader from '../Loader';
import config from '../../config';
import { mapLayers } from './mapLayers';
import { mapListeners } from './mapListeners';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { useLocation } from 'react-router-dom';
import { useMapStore } from '../../context/MapStore';

// import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

// import { useColorMode } from '@chakra-ui/react';

mapboxgl.accessToken = config.MAP.MAPBOX_TOKEN;

export const MapView = ({ showMap }) => {
  const { pathname } = useLocation();
  const { mapStyle: mode } = useMapStore();

  const mapRef = useRef(null);
  const mapContainer = useRef(null);
  const [mapIsLoaded, setMapIsLoaded] = useState(mapRef.current ? true : false);
  const [mapCenter, setCenter] = useState({
    center: [-78.863241, 42.882341],
    zoom: 9.5,
  });

  window.addEventListener('resize', () => {
    if (mapRef.current) mapRef.current.resize();
  });

  useEffect(() => {
    if (pathname.replace('map', '') !== '/') return;
    if (mapRef.current && showMap) {
      // console.log('[map] resizing map');
      mapRef.current.resize();
    }
    if (mapRef.current && mapIsLoaded) {
      const style = mapRef.current.getStyle();
      mapRef.current.resize();
      if (mode === 'DAY' && style.name === 'Rural Mobility Navigation Day')
        return;
      if (mode === 'NIGHT' && style.name === 'Rural Mobility Navigation Night')
        return;
      mapLayers(mapRef.current);
      mapRef.current.setStyle(config.MAP.BASEMAPS[mode]);
      return;
    }

    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: config.MAP.BASEMAPS[mode],
        center: mapCenter.center,
        zoom: mapCenter.zoom,
      })
        .addControl(new mapboxgl.NavigationControl(), 'top-right')
        .on('load', initMap)
        .on('style.load', mapLayers);
    }

    function initMap() {
      setMapIsLoaded(true);
      mapListeners(mapRef.current, setCenter, setMapIsLoaded);
    }

    //eslint-disable-next-line
  }, [mode, pathname]);

  return (
    <Box flex={1} display={showMap ? 'block' : 'none'}>
      {/* NOTE only show loader when map is actually open */}
      <Loader
        isOpen={!mapIsLoaded && pathname.replace('map', '') === '/'}
      ></Loader>
      <div ref={mapContainer} className="mapbox" style={{ height: '100%' }} />
    </Box>
  );
};
