import React, { useEffect, useState } from 'react';
import { Button, Flex, Stack, Text, useColorMode, Box } from '@chakra-ui/react';
import { MapComponent } from "../components/Map/MapComponent";
import { observer } from 'mobx-react-lite';
import { useStore } from '../context/RootStore';
import SearchForm from '../components/AddressSearchForm';
import { ScheduleTripHeader } from '../components/ScheduleTripHeader';
import { Loader } from '../components/Loader/Loader';
import { toJS } from 'mobx';

export const RoutesView = observer(({ }) => {
  const colorMode = useColorMode();
  const { map, mapState, setMapState, mapCache, getRoutes, getNearestStops,
    getRouteStops,
    getRoutePatterns, } = useStore().mapStore;
  const [routesAreLoaded, setRoutesAreLoaded] = useState(false);

  const getRouteList = (e, x, y) => {
    const exists = mapState.stoptimes?.features.length; //NOTE this disables the map from updating when the user pans if the stops are already loaded
    if (exists || !map) return;
    // setMapState('stoptimes', featureCollection([]));
    const { lng, lat } = map.getCenter();
    const stops = getNearestStops(y || lat, x || lng);
    if (!stops?.features.length) {
      console.log('no stops found');
      if (map && map.getSource('stops'))
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

  const routeClickHandler = async (route, retry) => {
    // if (retry) console.log('retrying route click handler')
    console.log('[map-view] route click handler');
    try {
      const id = route?.id || route?.routeId || null;
      setMapState('activeRoute', id)
      const patterns = await getRoutePatterns(id);
      if (!patterns?.features.length) throw new Error('no patterns found');
      const stoptimes = await getRouteStops(id);
      if (!stoptimes?.features.length) throw new Error('no stoptimes found');
      if (!map) return
      if (map.getSource('routes-highlight'))
        map.getSource('routes-highlight').setData(patterns);
      if (map.getSource('stops')) {
        map.getSource('stops').setData(stoptimes);
        map.setPaintProperty(
          'stops',
          'circle-stroke-color',
          route?.routeColor || '#000'
        );
        map.setPaintProperty(
          'stops',
          'circle-color',
          route?.outlineColor || '#fff'
        );
        map.fitBounds(stoptimes.bbox, { padding: 50 });
      }
    } catch (error) {
      // if (!retry) routeClickHandler(route, true);
      setMapState('activeRoute', '')
      console.log(error);
    }
  };

  const stopClickHandler = async stop => {
    if (!map) return
    if (stop && stop.geometry) {
      map.flyTo({
        center: stop.geometry.coordinates,
        zoom: map.getZoom() > 17 ? map.getZoom() : 17,
      });
      if (mapState.marker) {
        mapState.marker.setLngLat(stop.geometry.coordinates)
          .addTo(map);
      }
    }
  };

  const backClickHandler = () => {
    //CLEAR THE STATES
    setMapState('stoptimes', featureCollection([])); //NOTE this clears the stoptimes list and allows the route list to be displayed
    setMapState('activeRoute', '') //Clear the active route
    if (!map) return
    if (mapState.marker) mapState.marker.remove();
    map.getSource('routes-highlight').setData(featureCollection([]));
    map.getSource('stops').setData(featureCollection([]));

    //RESET TO THE PREVIOUS LOCATION AND CALL THE ROUTE LIST FUNCTION
    map.flyTo({ center: mapState.center, zoom: map.getZoom() }); //This will now trigger the getRouteList function
  };

  useEffect(() => {
    if (mapCache.routes.length) {
      setRoutesAreLoaded(true);
      if (!mapState.routes.length)
        getRouteList();
    }
  }, [mapCache.routes]);

  //DEBUG
  useEffect(() => {
    const _routes = toJS(mapCache.routes);
    const _stops = toJS(mapCache.stops);
    console.log({ _routes });
    console.log({ _stops });
  }, [mapCache.stops, mapCache.routes]);

  return (
    <Flex
      flex={1}
      flexDir={'row'}
      id="map-view"
      height={'calc(100vh - 60px)'}
      overflow={'hidden'}
    >
      {/* LEFT SIDEBAR */}
      <Flex
        flexDir={'column'}
        height="100%"
        width="420px"
        borderRight={'1px'}
        borderColor={colorMode === 'light' ? 'gray.200' : 'gray.900'}
        p={0}
        id="map-view-sidebar"
      >
        <Box>
          {/* TODO find a way to clear to search result */}
          <Box p={2}>
            <SearchForm
              saveAddress={() => { }}
              setGeocoderResult={e => {
                if (map) {
                  //TODO change this to a function
                  const zoom = map.getZoom();
                  map.flyTo({
                    center: [e?.point?.lng, e?.point?.lat],
                    zoom: zoom < 16 ? 16 : zoom,
                  });
                }
              }}
              label="Find Nearby Routes"
              resultsMaxWidth="402px"
            />
          </Box>
          <BackButton backClickHandler={backClickHandler} />
        </Box>
        {/* ROUTES AND STOPS LIST */}
        <RouteList routeClickHandler={routeClickHandler} />
        <StopTimesList
          stopClickHandler={stopClickHandler}
        />
        {/*  */}
      </Flex>

      {/* MAIN */}
      <Flex flex="1" flexDir={'column'} id="map-and-schedule">
        {/* HEADER */}
        <ScheduleTripHeader />
        {/* MAP */}
        <MapComponent showMap={true} getRouteList={() => { }} />
      </Flex>
      {/* NOTE only show loader when map is actually open */}
      <Loader
        isOpen={!routesAreLoaded}
      ></Loader>
    </Flex>
  )
});

const BackButton = observer(({ backClickHandler }) => {
  const { stoptimes } = useStore().mapStore.mapState;
  return (
    <>
      {stoptimes?.features.length ? (
        <Button
          // display={'flex'}
          my={2}
          width="100%"
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
    </>
  );
});

const StopTimesList = observer(({ stopClickHandler }) => {
  const { colorMode } = useColorMode();
  const { stoptimes, activeRoute } = useStore().mapStore.mapState;
  if (stoptimes.features.length) console.log(toJS(stoptimes.features[0]));
  if (activeRoute) console.log('[map-view] active route', toJS(activeRoute))
  // const stopIds = stoptimes?.features.map(s => s.properties.stopId) || [];
  // const uniqueStops = [...new Set(stopIds)]; // these are already in order of arrival time;

  return (
    <>
      {stoptimes.features.length ? (
        <Flex
          flexDir={'column'}
          flex={1}
          overflowY={'auto'}
          id="map-stoptimes"
          overflowX={'hidden'}
        >
          <Stack spacing={0}>
            {stoptimes.features.length
              ? stoptimes.features.map((s, i) => {
                // const stop = stoptimes.features.find(st => st.properties.stopId === s);
                // const times = stoptimes.features.filter(st => st.properties.stop_id === s);
                return (
                  <Button
                    display="block"
                    flexWrap={'wrap'}
                    textAlign={'left'}
                    background={colorMode === 'light' ? 'white' : 'gray.800'}
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
                    borderBottom={'solid 1px lightgray'}
                    borderLeft={'none'}
                    borderRight={'none'}

                  >
                    <Box textAlign={'left'} my={1}>
                      <Text fontSize={'md'} fontWeight={'bold'}>
                        {s?.properties?.name}
                      </Text>
                    </Box>
                    {/* <Box>
                      {s?.properties?.arrival ? formatters.datetime.asHHMMA(new Date(s.properties.arrival)) : ''}
                    </Box> */}
                    <Box py={1}>
                      {!s.properties?.stoptimes.length || s.properties?.stoptimes[0].times[0].arrival === 0 ? (<Text>N/A</Text>) : ''}
                      {s.properties?.stoptimes.length
                        ? s.properties?.stoptimes.map((trip, idx0) => {
                          return (
                            <Box key={idx0.toString()}>
                              {trip.pattern?.routeId === activeRoute && trip?.times?.length
                                ? (
                                  <Flex
                                    justifyContent={'start'}
                                    opacity={0.8}
                                    my={1}
                                  // key={idx.toString()}
                                  >
                                    <Text fontSize="sm" width="80px" overflow={'hidden'} mr={1} color={colorMode === 'light' ? 'gray.500' : 'gray.400'}>
                                      {/* {!time.arrival ? '' : formatters.datetime.asHHMMA(new Date(time.arrival))}
                                        {' '} */}
                                      {!trip?.times[0].arrival
                                        ? ''
                                        : formatters.datetime.asDuration(
                                          (new Date(trip.times[0].arrival).valueOf() - Date.now()) / 1000
                                        ) || '1 min'}
                                    </Text>
                                    <Text fontSize={'sm'}>
                                      {trip?.times[0]?.headsign ||
                                        'No Stop Times Available'}
                                    </Text>
                                    <Text>{trip?.times[0]?.delayed ? '!!' : ''}</Text>

                                  </Flex>
                                )

                                : ''}
                            </Box>
                          );
                        })
                        : ''}
                    </Box>
                  </Button>
                )
              })
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
  if (routes.length) console.log(toJS(routes));

  return (
    <>
      {stoptimes?.features.length ? (
        ''
      ) : (
        <Flex
          position={'relative'}
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