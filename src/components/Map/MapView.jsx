import 'mapbox-gl/dist/mapbox-gl.css';

import { Box, Button, Flex, Stack, Text } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

import Loader from '../Loader';
import { ScheduleTripHeader } from '../ScheduleTripHeader';
import SearchForm from '../AddressSearchForm';
import config from '../../config';
import debounce from '../../utils/debounce';
import { featureCollection } from '@turf/helpers';
import formatters from '../../utils/formatters';
import { getLocation } from '../../utils/getLocation';
import { mapControls } from './mapControls';
import { mapLayers } from './mapLayers';
import { mapListeners } from './mapListeners';
import mapboxgl from 'mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { useLocation } from 'react-router-dom';
import { useStore } from '../../context/RootStore';

// import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax

// import { useColorMode } from '@chakra-ui/react';

mapboxgl.accessToken = config.MAP.MAPBOX_TOKEN;

export const MapView = observer(({ showMap }) => {
  console.log('[map-view] rendering');
  const { pathname } = useLocation();
  const {
    mapStyle,
    mapCache,
    mapState,
    setMapState,
    getNearestStops,
    getRoutes,
    getRouteStops,
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
    const exists = mapState.stoptimes?.features.length;
    if (exists) return;
    setMapState('stoptimes', featureCollection([]));
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
    // if (map.getSource('stops')) map.getSource('stops').setData(stops);
    setMapState('routes', getRoutes(stops));
    setMapState('center', [lng, lat]);
    setMapState('zoom', map.getZoom());
  };

  const routeClickHandler = async route => {
    console.log('route click handler', route);
    try {
      const id = route?.id || route?.routeId || null;
      const patterns = await getRoutePatterns(id);
      if (!patterns?.features.length) throw new Error('no patterns found');
      const stoptimes = await getRouteStops(id);
      if (!stoptimes?.features.length) throw new Error('no stoptimes found');
      if (mapRef.current.getSource('routes-highlight'))
        mapRef.current.getSource('routes-highlight').setData(patterns);
      if (mapRef.current.getSource('stops')) {
        mapRef.current.getSource('stops').setData(stoptimes);
        mapRef.current.setPaintProperty(
          'stops',
          'circle-stroke-color',
          route?.routeColor || '#000'
        );
        mapRef.current.setPaintProperty(
          'stops',
          'circle-color',
          route?.outlineColor || '#fff'
        );
        mapRef.current.fitBounds(stoptimes.bbox, { padding: 50 });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const stopClickHandler = async stop => {
    if (stop && stop.geometry) {
      mapRef.current.flyTo({
        center: stop.geometry.coordinates,
        zoom: mapRef.current.getZoom() > 17 ? mapRef.current.getZoom() : 17,
      });
    }
  };

  const backClickHandler = () => {
    setMapState('stoptimes', featureCollection([]));
    mapRef.current.flyTo({ center: mapState.center, zoom: mapState.zoom });
    mapRef.current.getSource('routes-highlight').setData(featureCollection([]));
    mapRef.current.getSource('stops').setData(featureCollection([]));
  };

  useEffect(() => {
    if (mapCache.routes.length) {
      setRoutesAreLoaded(true);
      if (mapRef?.current && !mapState.routes.length)
        getRouteList(mapRef.current);
    }
  }, [mapCache.routes]);

  //DEBUG
  useEffect(() => {
    const _routes = toJS(mapCache.routes);
    const _stops = toJS(mapCache.stops);
    console.log({ _routes });
    console.log({ _stops });
  }, [mapCache.stops, mapCache.routes]);

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
        mapRef.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: config.MAP.BASEMAPS[mapStyle], //change to style from store
          center: center,
          zoom: 16,
        })
          .addControl(mapControls.nav, 'top-right')
          .addControl(mapControls.locate, 'top-right')
          .addControl(mapControls.bookmarks, 'top-right')
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
    })();

    function initMap() {
      // const map = this;
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
        {/* ROUTES AND STOPS LIST */}
        <RouteList routeClickHandler={routeClickHandler} />
        <StopTimesList
          stopClickHandler={stopClickHandler}
          backClickHandler={backClickHandler}
        />
        {/*  */}
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

const StopTimesList = observer(({ stopClickHandler, backClickHandler }) => {
  const { stoptimes } = useStore().mapStore.mapState;
  console.log(toJS(stoptimes.features[0]));
  return (
    <>
      {stoptimes?.features.length ? (
        <Flex
          mt={2}
          flexDir={'column'}
          flex={1}
          overflowY={'auto'}
          id="map-stoptimes"
        >
          {stoptimes?.features.length ? (
            <Button
              display="flex"
              borderRadius={0}
              colorScheme="yellow"
              onClick={backClickHandler}
              fontSize="md"
              fontWeight="bold"
              minH={'40px'}
            >
              Back
            </Button>
          ) : (
            ''
          )}
          <Stack spacing={0} mt={2}>
            {stoptimes?.features.length
              ? stoptimes.features.map((s, i) => (
                  <Button
                    display="block"
                    flexWrap={'wrap'}
                    textAlign={'left'}
                    backgroundColor={'white'}
                    justifyContent={'flex-start'}
                    key={i.toString()}
                    fontSize="sm"
                    fontWeight="bold"
                    minH={'40px'}
                    height={'auto'}
                    margin={0}
                    px={2}
                    py={2}
                    borderRadius={0}
                    onClick={() => stopClickHandler(s)}
                  >
                    <Box textAlign={'left'}>
                      <Text fontSize={'sm'} fontWeight={'bold'}>
                        {s.properties?.id} - {s.properties.name}
                      </Text>
                    </Box>
                    <Box py={1}>
                      {s.properties?.stoptimes.length
                        ? s.properties?.stoptimes.map((pattern, idx0) => {
                            return (
                              <Box key={idx0.toString()}>
                                {pattern?.times?.length
                                  ? pattern.times.map((time, idx) => {
                                      return (
                                        <Flex
                                          justifyContent={'space-between'}
                                          key={idx.toString()}
                                        >
                                          <Text fontSize={'xs'}>
                                            {pattern?.times[0]?.headsign ||
                                              'No Stop Times Available'}
                                          </Text>
                                          <Text fontSize="xs">
                                            {!time.arrival
                                              ? ''
                                              : formatters.datetime.asHHMMA(
                                                  new Date(time.arrival)
                                                )}
                                          </Text>
                                        </Flex>
                                      );
                                    })
                                  : ''}
                              </Box>
                            );
                          })
                        : ''}
                    </Box>
                  </Button>
                ))
              : ''}
          </Stack>
        </Flex>
      ) : (
        ''
      )}
    </>
  );
});

const RouteList = observer(({ routeClickHandler }) => {
  const { routes, stoptimes } = useStore().mapStore.mapState;
  console.log(toJS(routes));

  return (
    <>
      {stoptimes?.features.length ? (
        ''
      ) : (
        <Flex
          mt={2}
          flexDir={'column'}
          flex={1}
          overflowY={'auto'}
          id="map-route-list"
        >
          {routes.length
            ? routes.map((r, i) => (
                <Button
                  display="flex"
                  justifyContent={'flex-start'}
                  key={i.toString()}
                  background={
                    r?.color ? `#${r.color.replace('#', '')}` : 'nfta'
                  }
                  color={r?.outlineColor || 'white'}
                  p={'2'}
                  _hover={{
                    filter: 'brightness(1.1) saturate(1.3)',
                  }}
                  fontSize="sm"
                  fontWeight="bold"
                  minH={'40px'}
                  margin={0}
                  borderRadius={0}
                  outline={'solid 1px white'}
                  onClick={() => routeClickHandler(r)}
                >
                  <span style={{ width: '40px', textAlign: 'left' }}>
                    {r.routeId}
                  </span>{' '}
                  {r?.mode} {r?.longName ? r.longName.slice(0, 25) : ''}
                </Button>
              ))
            : ''}
        </Flex>
      )}
    </>
  );
});
