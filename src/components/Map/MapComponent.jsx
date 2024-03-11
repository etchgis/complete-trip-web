import 'mapbox-gl/dist/mapbox-gl.css';

import { useEffect, useRef, useState } from 'react';

import { Box } from '@chakra-ui/react';
import Loader from '../Loader';
import config from '../../config';
import { getLocation } from '../../utils/getLocation';
import { map } from 'lodash';
import { mapControls } from './mapboxControls.js';
import { mapLayers } from './mapLayers';
// import { mapListeners } from './mapListeners';
import mapboxgl from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { observer } from 'mobx-react-lite';
import { useLocation } from 'react-router-dom';
import { useStore } from '../../context/RootStore';
import useTranslation from '../../models/useTranslation.js';

// import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

// import { useColorMode } from '@chakra-ui/react';

mapboxgl.accessToken = config.MAP.MAPBOX_TOKEN;

export const MapComponent = observer(({ showMap }) => {
  // console.log('[map-view] rendering');
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const {
    setMapX,
    setMap,
    mapStyle,
    mapCache,
    setMapState,
    setMapGeolocation,
  } = useStore().mapStore;
  const { ux } = useStore().uiStore;
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
      setMapState('geolocation', [longitude, latitude]);
    });

    (async () => {
      const queryParams = new URLSearchParams(window.location.search);
      const location = queryParams.get('location');
      console.log('[map] location:', location);
      const userLocation = location
        ? { center: location.split(',').map(l => +l) }
        : await getLocation();
      console.log('[map] userLocation:', userLocation);
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
            zoom: config.MAP.ZOOM,
          })
            .addControl(mapControls.nav, 'top-right')
            // .addControl(mapControls.bookmarks, 'top-right')
            .on('load', initMap)
            .on('style.load', mapLayers)
            .on('moveend', e => {
              // console.log('moveend');
              const { lng, lat } = e.target.getCenter();
              setMapState('geolocation', [lng, lat]);
              // debounce(getRouteList(e.target), 1000);
            })
            .on('contextmenu', e => {
              console.log(e.target.getZoom());
              console.log(e.lngLat);
              console.log(mapRef.current.getCenter());
              console.log(mapRef.current.getStyle().layers);
            });
          if (ux === 'webapp')
            mapRef.current.addControl(mapControls.locate, 'top-right');
        } catch (error) {
          setMapIsLoaded(true);
          console.log(error);
        }
      }
    })();

    function initMap() {
      setMap(this);
      // mapControls.locate.trigger();
      setMapIsLoaded(true);
      // mapListeners(map, setMapIsLoaded);
    }

    //eslint-disable-next-line
  }, [mapStyle, pathname, mapCache.stops]);

  return (
    <>
      <Box
        ref={mapContainer}
        className="mapbox"
        style={{ height: '100%', flex: 1 }}
        id="map-container"
      />
      <Loader isOpen={!mapIsLoaded && pathname === '/map'}></Loader>
    </>
  );
});
