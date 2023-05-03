import 'mapbox-gl/dist/mapbox-gl.css';

import { Box, Flex } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

import Loader from '../Loader';
import { ScheduleTripHeader } from '../ScheduleTripHeader';
import SearchForm from '../AddressSearchForm';
import config from '../../config';
import { mapLayers } from './mapLayers';
import { mapListeners } from './mapListeners';
import mapboxgl from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { observer } from 'mobx-react-lite';
import { useLocation } from 'react-router-dom';
import { useStore } from '../../context/RootStore';

// import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

// import { useColorMode } from '@chakra-ui/react';

mapboxgl.accessToken = config.MAP.MAPBOX_TOKEN;

export const MapView = observer(({ showMap }) => {
  const { pathname } = useLocation();
  const { mapStyle } = useStore().mapStore;
  const mapRef = useRef(null);
  const mapContainer = useRef(null);
  const [mapIsLoaded, setMapIsLoaded] = useState(mapRef?.current ? true : false);
  const [mapCenter, setCenter] = useState({
    center: [-78.863241, 42.882341],
    zoom: 9.5,
  });

  window.addEventListener('resize', () => {
    if (mapRef?.current) mapRef.current.resize();
  });

  useEffect(() => {
    if (pathname.replace('map', '') !== '/') return;

    if ((mapRef?.current) && showMap) {
      // console.log('[map] resizing map');
      mapRef.current.resize();
    }

    if ((mapRef?.current) && mapIsLoaded) {
      const style = mapRef.current.getStyle();
      mapRef.current.resize();
      if (mapStyle === 'DAY' && style.name === 'Rural Mobility Navigation Day')
        return;
      if (mapStyle === 'NIGHT' && style.name === 'Rural Mobility Navigation Night')
        return;
      mapLayers(mapRef.current);
      mapRef.current.setStyle(config.MAP.BASEMAPS[mapStyle]);
      return;
    }

    if (!mapRef?.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: config.MAP.BASEMAPS[mapStyle],
        center: mapCenter.center,
        zoom: 11,
      })
        .addControl(new mapboxgl.NavigationControl(), 'top-right')
        .on('load', initMap)
        .on('style.load', mapLayers);
    }

    function initMap() {
      const map = this;
      setMapIsLoaded(true);
      mapListeners(map, setCenter, setMapIsLoaded);
    }

    //eslint-disable-next-line
  }, [mapStyle, pathname]);

  return (
    <Flex flex={1} display={showMap ? 'flex' : 'none'} flexDir={'row'}>
      <Box height="100%" width="300px" borderRight={"1px"} borderColor={mapStyle === 'DAY' ? 'gray.200' : 'gray.900'} p={2}>
        <SearchForm
          saveAddress={() => { }}
          setGeocoderResult={() => { }}
          label=""
        />
        Route List
      </Box>
      <Flex flex="1" flexDir={'column'}>
        <ScheduleTripHeader />
        <Box ref={mapContainer} className="mapbox" style={{ height: '100%', flex: 1 }} />
      </Flex>
      {/* NOTE only show loader when map is actually open */}
      <Loader
        isOpen={!mapIsLoaded && pathname.replace('map', '') === '/'}
      ></Loader>
    </Flex>
  );
});
