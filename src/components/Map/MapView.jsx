import 'mapbox-gl/dist/mapbox-gl.css';

import { Box, Button, Flex } from '@chakra-ui/react';
import { set, toJS } from 'mobx';
import { useEffect, useRef, useState } from 'react';

import Loader from '../Loader';
import { ScheduleTripHeader } from '../ScheduleTripHeader';
import SearchForm from '../AddressSearchForm';
import config from '../../config';
import debounce from '../../utils/debounce';
import { featureCollection } from '@turf/helpers';
import { mapControls } from './mapControls';
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
  console.log('[map-view] rendering');
  const { pathname } = useLocation();
  const {
    routes: otpRoutes,
    mapStyle,
    getRoutes,
    mapData,
    mapState,
    setMapState,
    getNearestStops,
    getRoutePatterns,
    getRoutePatternGeometry,
    getPatternStops,
  } = useStore().mapStore;
  const mapRef = useRef(null);
  const mapContainer = useRef(null);
  const [mapIsLoaded, setMapIsLoaded] = useState(
    mapRef?.current ? true : false
  );
  const [routesAreLoaded, setRoutesAreLoaded] = useState(false);

  window.addEventListener('resize', () => {
    if (mapRef?.current) mapRef.current.resize();
  });

  const getRouteList = (e, x, y) => {
    const exists = mapState.patterns.length;
    if (exists) return;
    setMapState('patterns', []);
    const map = e.target ? e.target : e;
    const { lng, lat } = map.getCenter();
    const stops = getNearestStops(y || lat, x || lng);
    if (!stops?.features.length) {
      console.log('no stops found');
      if (map.getSource('stops'))
        map.getSource('stops').setData(featureCollection([]));
      setMapState('routes', []);
      return;
    }
    // console.log({ stops })
    if (map.getSource('stops')) map.getSource('stops').setData(stops);
    setMapState('routes', getRoutes(stops));
    setMapState('center', [lng, lat]);
    setMapState('zoom', map.getZoom());
  };

  const routeClickHandler = async e => {
    if (!e.target.dataset.routeid || e.target.dataset.desc) return;
    const patterns = await getRoutePatterns(e.target.dataset.routeid);
    setMapState('patterns', patterns);
  };

  const patternClickHandler = async e => {
    if (!e.target.dataset.patternid) return;
    const { patterns } = mapState;
    const geojson = await getRoutePatternGeometry(
      patterns.find(p => p.id === e.target.dataset.patternid)
    );
    const stops = await getPatternStops(e.target.dataset.patternid);
    if (mapRef.current.getSource('stops')) {
      mapRef.current.getSource('stops').setData(stops);
    }
    if (geojson.features.length) {
      mapRef.current.getSource('routes-highlight').setData(geojson);
      mapRef.current.fitBounds(geojson.bbox, { padding: 50 });
    }
  };

  const backClickHandler = () => {
    setMapState('patterns', []);
    mapRef.current.flyTo({ center: mapState.center, zoom: mapState.zoom });
    mapRef.current.getSource('routes-highlight').setData(featureCollection([]));
  };

  useEffect(() => {
    if (otpRoutes.length) {
      setRoutesAreLoaded(true);
      if (mapRef?.current) getRouteList(mapRef.current);
    }
  }, [otpRoutes]);

  //DEBUG
  // useEffect(() => {
  //   const _routes = toJS(otpRoutes);
  //   const _stops = toJS(mapData.stops);
  //   console.log({ _routes })
  //   console.log({ _stops })
  // }, [routes, mapData.stops])

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

    if (!mapRef?.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: config.MAP.BASEMAPS[mapStyle],
        center: [config.MAP.CENTER[1], config.MAP.CENTER[0]],
        zoom: 12,
      })
        .addControl(mapControls.nav, 'top-right')
        .addControl(mapControls.locate, 'top-right')
        .on('load', initMap)
        .on('style.load', mapLayers)
        .on('moveend', e => {
          debounce(getRouteList(e.target), 1000);
        })
        .on('contextmenu', e => {
          console.log(e.target.getZoom());
          console.log(e.lngLat);
        });
    }

    function initMap() {
      const map = this;
      // locateControl.trigger();
      setMapIsLoaded(true);
      // mapListeners(map, setMapIsLoaded);
    }

    //eslint-disable-next-line
  }, [mapStyle, pathname, mapData.stops]);

  return (
    <Flex
      flex={1}
      display={showMap ? 'flex' : 'none'}
      flexDir={'row'}
      id="map-view"
      height={'calc(100vh - 60px)'}
      overflow={'hidden'}
    >
      {/* LEFT SIDEBAR */}
      <Flex
        flexDir={'column'}
        height="100%"
        width="340px"
        borderRight={'1px'}
        borderColor={mapStyle === 'DAY' ? 'gray.200' : 'gray.900'}
        p={0}
        id="map-sidebar"
      >
        <Box p={2}>
          {/* TODO find a way to clear to search result */}
          <SearchForm
            saveAddress={() => {}}
            setGeocoderResult={e => {
              if (mapRef?.current) {
                //TODO change this to a function
                const zoom = mapRef.current.getZoom();
                mapRef.current.flyTo({
                  center: [e?.point?.lng, e?.point?.lat],
                  zoom: zoom < 16 ? 16 : zoom,
                });
              }
            }}
            label="Find Nearby Routes"
            resultsMaxWidth="322px"
          />
        </Box>
        <RouteList
          routeClickHandler={routeClickHandler}
          patternClickHandler={patternClickHandler}
          backClickHandler={backClickHandler}
        />
      </Flex>
      {/* MAIN */}
      <Flex flex="1" flexDir={'column'} id="map-main">
        {/* HEADER */}
        <ScheduleTripHeader />
        {/* MAP */}
        <Box
          ref={mapContainer}
          className="mapbox"
          style={{ height: '100%', flex: 1 }}
          id="map-container"
        />
      </Flex>
      {/* NOTE only show loader when map is actually open */}
      <Loader
        isOpen={(!mapIsLoaded || !routesAreLoaded) && pathname === '/map'}
      ></Loader>
    </Flex>
  );
});

const RouteList = observer(
  ({ routeClickHandler, patternClickHandler, backClickHandler }) => {
    const { routes, patterns } = useStore().mapStore.mapState;
    const elements = patterns.length ? patterns : routes;
    console.log({ elements });
    return (
      // TODO add back button to go back to route list - generated from routes[0].routeId
      <Flex mt={2} flexDir={'column'} flex={1} overflowY={'auto'}>
        {patterns.length ? (
          <Button
            display="flex"
            borderRadius={0}
            colorScheme="yellow"
            onClick={backClickHandler}
          >
            Back
          </Button>
        ) : (
          ''
        )}
        {elements.length ? (
          elements.map((r, i) => (
            <Button
              display="flex"
              justifyContent={'flex-start'}
              key={i.toString()}
              background={'nfta'}
              color="white"
              p={'2'}
              _hover={{
                background: 'nftaLight',
              }}
              fontSize="sm"
              fontWeight="bold"
              minH={'40px'}
              margin={0}
              borderRadius={0}
              outline={'solid 1px white'}
              onClick={
                patterns.length ? patternClickHandler : routeClickHandler
              }
              data-routeid={r?.routeId}
              data-desc={r?.desc}
              data-patternid={patterns.length ? r.id : null}
            >
              <span style={{ width: '40px', textAlign: 'left' }}>
                {r.routeId}
              </span>{' '}
              {r?.mode} {r?.longName ? r.longName.slice(0, 25) : r?.desc || ''}
            </Button>
          ))
        ) : (
          <Box px={4}>No routes found</Box>
        )}
      </Flex>
    );
  }
);
