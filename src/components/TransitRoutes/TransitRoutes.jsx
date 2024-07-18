import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Stack,
  Text,
  useColorMode,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

import AddressSearchForm from '../AddressSearchForm';
import Loader from '../Loader';
import { WarningTwoIcon } from '@chakra-ui/icons';
import config from '../../config';
import debounce from '../../utils/debounce';
import { featureCollection } from '@turf/helpers';
import formatters from '../../utils/formatters';
import moment from 'moment';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { useLocation } from 'react-router-dom';
import { useStore } from '../../context/RootStore';
import useTranslation from '../../models/useTranslation';
import { mobility } from '@etchgis/mobility-transport-layer';
import { geocoder } from '../../services/transport';

export const TransitRoutes = observer(({ onShuttlePress }) => {
  const colorMode = useColorMode();
  const { map, mapState, setMapState, mapCache, getRoutes, getStops } =
    useStore().mapStore;
  const { debug, setKeyboardInputValue, ux } = useStore().uiStore;
  // const [routesAreLoaded, setRoutesAreLoaded] = useState(false);
  const [showLoader, setShowLoader] = useState(
    mapState.routesLoading || mapState.stopsLoading
  );
  const [defaultAddress, setDefaultAddress] = useState('');
  const [searchResult, setSearchResult] = useState(false);
  const { pathname } = useLocation();

  const intervalRef = useRef();
  const { t } = useTranslation();

  useEffect(() => {
    if (debug) console.log('mapState.geolocation', mapState.geolocation.length);
    //NOTE this is supposed to fire on map moveend and on map GPS button
    if (mapState.geolocation.length) {
      debounce(
        getRouteList(mapState.geolocation[0], mapState.geolocation[1]),
        1000
      );
      if (searchResult) {
        if (debug) console.log('restting search result timer');
        setTimeout(() => setSearchResult(false), 1000);
      } else {
        if (debug) console.log('restting search result');
        setDefaultAddress('');
      }
    }
    // eslint-disable-next-line
  }, [mapState.geolocation]);

  const getRouteList = (x, y) => {
    const exists = mapState?.stoptimes?.features.length; //NOTE this disables the map from updating when the user pans if the stops are already loaded)
    if (exists) {
      console.log(
        '[transit-routes] stops already loaded - exting getRouteList'
      );
      return;
    }
    const { lng, lat } = map ? map.getCenter() : { lng: x, lat: y };
    //latlng of buffalo
    const buffalo = [config.MAP.CENTER[1], config.MAP.CENTER[0]];
    getRoutes(x || lng || buffalo[0], y || lat || buffalo[1]);

    // setMapState('center', [lng, lat]);
    if (map) setMapState('zoom', map.getZoom());
  };

  const reset = () => {
    console.log('no stops found');
    if (map && map.getSource('stops'))
      map.getSource('stops').setData(featureCollection([]));
    // setMapState('routes', []);
    setMapState('stoptimes', featureCollection([]));
    setMapState('activeRoute', '');
  };

  const routeClickHandler = async service => {
    console.log('[map-view] route click handler');
    try {
      setDefaultAddress('');
      setKeyboardInputValue(''); //NOTE this is supposed to clear the keyboard input (not working)
      setMapState('activeRoute', service);
      if (service.service && service.route) {
        getStops(service, true)
          .then(result => {
            const { route, stops, vehicles } = result;
            if (!route?.features.length) throw new Error('no patterns found');
            if (map.getSource('routes-highlight'))
              map.getSource('routes-highlight').setData(route);
            if (map.getSource('stops')) {
              map.getSource('stops').setData(stops);
              map.setPaintProperty(
                'stops',
                'circle-stroke-color',
                `#${service?.color || '#000'}`
              );
              map.setPaintProperty(
                'stops',
                'circle-color',
                `#${service?.textColor || '#fff'}`
              );
            }
            if (map.getSource('buses-live')) {
              map.getSource('buses-live').setData(vehicles);
            }
            map.fitBounds(route.bbox, { padding: 50 });

            refreshRoute(service);
          })
          .catch(e => {
            console.error('getRoutesAndStops', e);
          });
      }
      else if (service.mode === 'shuttle') {
        const hdsStart = moment().hour(config.HDS_HOURS.start[0]).minute(config.HDS_HOURS.start[1]).second(0),
          hdsEnd = moment().hour(config.HDS_HOURS.end[0]).minute(config.HDS_HOURS.end[1]).second(0);
        const inTimeframe = moment().isAfter(hdsStart) && moment().isBefore(hdsEnd);
        // const inTimeframe = moment().hour() >= config.HDS_HOURS.start && moment().hour() <= config.HDS_HOURS.end;
        if (onShuttlePress && inTimeframe) {
          onShuttlePress(service);
        }
        if (!inTimeframe) {
          alert(t('routeList.shuttleNotAvailableTimeFrame'));
        }
      }
    } catch (error) {
      setMapState('activeRoute', '');
      console.log(error);
    }
  };

  const refreshRoute = service => {
    console.log('intervalRef.current', intervalRef.current);
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        getStops(service)
          .then(result => {
            const { stops, vehicles } = result;
            if (map.getSource('stops')) {
              map.getSource('stops').setData(stops);
              map.setPaintProperty(
                'stops',
                'circle-stroke-color',
                `#${service?.color || '#000'}`
              );
              map.setPaintProperty(
                'stops',
                'circle-color',
                `#${service?.textColor || '#fff'}`
              );
            }
            if (map.getSource('buses-live')) {
              map.getSource('buses-live').setData(vehicles);
            }
          })
          .catch(e => {
            console.error('INTERVAL ERROR: getRoutesAndStops', e);
          });
      }, 5000);
    }
  };

  // useEffect(() => {
  //   if (map) {
  //     console.log('GOT UPDATES');
  //     if (map.getSource('routes-highlight'))
  //       map.getSource('routes-highlight').setData(mapState.routes);
  //     if (map.getSource('stops')) {
  //       map.getSource('stops').setData(mapState.stoptimes);
  //       map.setPaintProperty(
  //         'stops',
  //         'circle-stroke-color',
  //         `#${mapState?.activeRoute?.service?.color || '000'}`
  //       );
  //       map.setPaintProperty(
  //         'stops',
  //         'circle-color',
  //         `#${mapState?.activeRoute?.service?.textColor || 'fff'}`
  //       );
  //     }
  //     if (map.getSource('buses-live')) {
  //       map.getSource('buses-live').setData(mapState.vehicles);
  //     }
  //   }
  //   // eslint-disable-next-line
  // }, [mapState.routes, mapState.stoptimes, mapState.vehicles]);

  const stopClickHandler = async stop => {
    if (stop && stop.geometry && map) {
      map.flyTo({
        center: stop.geometry.coordinates,
        zoom: map.getZoom() > 17 ? map.getZoom() : 17,
      });
      if (mapState.marker) {
        mapState.marker.setLngLat(stop.geometry.coordinates).addTo(map);
      }
    }
  };

  const backClickHandler = () => {
    if (!map) return;
    //CLEAR THE STATES
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setMapState('stoptimes', featureCollection([])); //NOTE this clears the stoptimes list and allows the route list to be displayed
    setMapState('activeRoute', ''); //Clear the active route
    if (mapState.marker) mapState.marker.remove();

    //BUG sometimes these are not defined so it causes an error - cannot reproduce
    if (map.getSource('routes-highlight'))
      map.getSource('routes-highlight').setData(featureCollection([]));
    if (map.getSource('stops'))
      map.getSource('stops').setData(featureCollection([]));
    if (map.getSource('buses-live'))
      map.getSource('buses-live').setData(featureCollection([]));

    if (!map.getSource('routes-highlight'))
      console.log({ error: 'TransitRoutes: missing map sources to reset' });

    //RESET TO THE PREVIOUS LOCATION AND CALL THE ROUTE LIST FUNCTION
    //BUG on the first load, sometimes the mapState.center is not defined but yet there are routes in the mapState.routes
    if (mapState?.center?.length) {
      map.flyTo({ center: mapState.center, zoom: map.getZoom() });
    } else {
      console.log({ error: 'TransitRoutes: no center found in mapState' });
      map.flyTo({
        center: [config.MAP.CENTER[1], config.MAP.CENTER[0]],
        zoom: map.getZoom(),
      });
    }
  };

  useEffect(() => {
    if (mapCache.routes.length) {
      setMapState('routes', mapCache.routes);
    }
    // eslint-disable-next-line
  }, [mapCache.routes]);

  useEffect(() => {
    setShowLoader(mapState.routesLoading || mapState.stopsLoading);
    // eslint-disable-next-line
  }, [mapState.routesLoading, mapState.stopsLoading]);

  //DEBUG
  useEffect(() => {
    if (!debug) return;
    const _routes = toJS(mapCache.routes);
    const _stops = toJS(mapCache.stops);
    console.log({ _routes });
    console.log({ _stops });
  }, [mapCache.stops, mapCache.routes]);

  return (
    <>
      {/* ----------------------- */}
      {/* TRANSIT ROUTES */}
      {/* ----------------------- */}
      <Flex
        flexDir={'column'}
        height="100%"
        width={(ux === 'webapp' || ux === 'callcenter') ? '420px' : '270px'}
        borderRight={'1px'}
        borderColor={colorMode === 'light' ? 'gray.200' : 'gray.900'}
        p={0}
        id="transit-routes"
      >
        <Box>
          {/* TODO find a way to clear to search result */}
          <Box p={2}>
            <AddressSearchForm
              saveAddress={() => { }}
              setGeocoderResult={e => {
                if (map) {
                  //TODO change this to a function
                  const zoom = map.getZoom();
                  map.flyTo({
                    center: [e?.point?.lng, e?.point?.lat],
                    zoom: zoom < 16 ? 16 : zoom,
                  });
                  setDefaultAddress(e.name);
                  setSearchResult(true);
                  reset();
                }
              }}
              defaultAddress={defaultAddress}
              label={t('map.searchTitle')}
              resultsMaxWidth="402px"
              inputName="transitSearch"
            />
          </Box>
          <BackButton backClickHandler={backClickHandler} />
        </Box>
        {/* ROUTES AND STOPS LIST */}
        <RouteList routeClickHandler={routeClickHandler} />
        <StopTimesList stopClickHandler={stopClickHandler} />
      </Flex>
      {/* NOTE only show loader when map is actually open */}
      <Loader isOpen={showLoader && pathname === '/map'}></Loader>
      {/* ----------------------- */}
      {/* ----------------------- */}
    </>
  );
});

const BackButton = observer(({ backClickHandler }) => {
  const { stoptimes } = useStore().mapStore.mapState;
  const { t } = useTranslation();
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
          {t('global.prev')}
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
  // if (stoptimes.features.length) console.log('[map-view] active stops', toJS(stoptimes.features));
  // if (activeRoute) console.log('[map-view] active route', toJS(activeRoute));

  return (
    <>
      {stoptimes.features.length ? (
        <Flex
          flexDir={'column'}
          flex={1}
          overflowY={'auto'}
          id="map-stoptimes"
          overflowX={'hidden'}
          data-testid="map-stoptimes"
        >
          {stoptimes.features
            .filter(s => s.properties.filter)
            .map((s, i) => {
              return (
                <Button
                  key={i.toString()}
                  display="block"
                  flexWrap={'wrap'}
                  textAlign={'left'}
                  background={s.properties.color}
                  color={s.properties.textColor}
                  _hover={{
                    filter: 'brightness(1.1) saturate(1.3)',
                  }}
                  justifyContent={'flex-start'}
                  fontSize="sm"
                  // minH={'90px'}
                  height={'auto'}
                  margin={0}
                  paddingX={'15px'}
                  paddingY={'8px'}
                  borderRadius={0}
                  onClick={() => stopClickHandler(s)}
                  borderBottom={'solid 1px lightgray'}
                  borderLeft={'none'}
                  borderRight={'none'}
                  width="100%"
                  whiteSpace={'normal'}
                >
                  <Flex flexDirection={'row'} width={'100%'}>
                    <Flex flexDirection={'column'} flex={1} width={'300px'}>
                      <span
                        style={{
                          fontSize: 18,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {s.properties.name}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 'bold' }}>
                        {s.properties.publicCode}
                      </span>
                      {s.properties?.routes && (
                        <span>{`Servicing Route${s.properties.routes.length !== 0 ? 's' : ''
                          } ${s.properties.routes.join(',')}`}</span>
                      )}
                    </Flex>
                    <Flex
                      flex={3}
                      width={'100%'}
                      flexDirection={'column'}
                      alignItems={'flex-end'}
                    >
                      {s.properties.arrive && (
                        <span style={{ fontSize: 16 }}>
                          {moment(s.properties.arrive).format('h:mm A')}
                        </span>
                      )}
                      {s.properties.arriveNext && (
                        <span style={{ fontSize: 16 }}>
                          {moment(s.properties.arriveNext).format('h:mm A')}
                        </span>
                      )}
                    </Flex>
                  </Flex>
                </Button>
              );
            })}
        </Flex>
      ) : (
        ''
      )}
    </>
  );

  // return (
  //   <>
  //     {stoptimes.features.length ? (
  //       <Flex
  //         flexDir={'column'}
  //         flex={1}
  //         overflowY={'auto'}
  //         id="map-stoptimes"
  //         overflowX={'hidden'}
  //         data-testid="map-stoptimes"
  //       >
  //         <Stack spacing={0}>
  //           {stoptimes.features.length
  //             ? stoptimes.features.map((s, i) => {
  //               const trip = s.properties;
  //               // const stop = stoptimes.features.find(st => st.properties.stopId === s);
  //               // const times = stoptimes.features.filter(st => st.properties.stop_id === s);
  //               return (
  //                 <Button
  //                   key={i.toString()}
  //                   display="block"
  //                   flexWrap={'wrap'}
  //                   textAlign={'left'}
  //                   background={colorMode === 'light' ? 'white' : 'gray.800'}
  //                   __hover={{ backgroundColor: 'gray.100' }}
  //                   justifyContent={'flex-start'}
  //                   fontSize="sm"
  //                   fontWeight="bold"
  //                   minH={'90px'}
  //                   height={'auto'}
  //                   margin={0}
  //                   px={2}
  //                   py={2}
  //                   borderRadius={0}
  //                   onClick={() => stopClickHandler(s)}
  //                   borderBottom={'solid 1px lightgray'}
  //                   borderLeft={'none'}
  //                   borderRight={'none'}
  //                   width="100%"
  //                 >
  //                   {!trip?.arrival || trip.arrival === 0 ? (
  //                     <Flex p={2}>
  //                       <Text width="50px">N/A</Text>
  //                       <Text fontSize={'md'}>
  //                         {trip?.headsign || trip?.name}
  //                       </Text>
  //                     </Flex>
  //                   ) : (
  //                     <Box data-id="stoptime-el">
  //                       {trip?.routeId === activeRoute ? (
  //                         <Flex
  //                           justifyContent={'start'}
  //                           alignItems={'center'}
  //                           opacity={0.8}
  //                           my={1}
  //                         // key={idx.toString()}
  //                         >
  //                           <Flex
  //                             flexDir={'column'}
  //                             color="nfta"
  //                             width="50px"
  //                             alignItems={'center'}
  //                             pr={2}
  //                           >
  //                             <Text fontSize="xl">
  //                               {!trip?.arrival
  //                                 ? ''
  //                                 : formatStopTime(trip?.arrival)[0]}
  //                             </Text>
  //                             <Text fontSize="xs">
  //                               {!trip?.arrival
  //                                 ? ''
  //                                 : formatStopTime(trip?.arrival)[1]}
  //                             </Text>
  //                           </Flex>
  //                           <Box flex={1}>
  //                             <Text fontSize={'sm'} fontWeight="bold">
  //                               {trip?.headsign || 'No Stop Times Available'}
  //                             </Text>
  //                             <Text fontSize={'sm'} opacity={0.7} mt={1}>
  //                               {trip?.name}
  //                             </Text>
  //                           </Box>
  //                           <Flex
  //                             flexDir={'column'}
  //                             justifyContent={'center'}
  //                             alignItems={'center'}
  //                             color="red.600"
  //                           >
  //                             {trip?.delayed ? (
  //                               <>
  //                                 <WarningTwoIcon
  //                                 // color
  //                                 />
  //                                 <Box as="span" fontSize={'xs'}>
  //                                   {trip?.delay}
  //                                 </Box>
  //                               </>
  //                             ) : (
  //                               ''
  //                             )}
  //                           </Flex>
  //                         </Flex>
  //                       ) : (
  //                         ''
  //                       )}
  //                     </Box>
  //                   )}
  //                 </Button>
  //               );
  //             })
  //             : ''}
  //         </Stack>
  //       </Flex>
  //     ) : (
  //       ''
  //     )}
  //   </>
  // );
});

const RouteList = observer(({ routeClickHandler }) => {
  const { routes, stoptimes } = useStore().mapStore.mapState;
  const { updateShuttle } = useStore().mapStore;
  const { debug } = useStore().uiStore;
  if (routes.length && debug) console.log(toJS(routes));
  const { t } = useTranslation();
  const { ux } = useStore().uiStore;

  const timeToDuration = timestamp => {
    let diff = timestamp - Date.now();
    return diff / 1000;
  };

  const durationToString = timestamp => {
    const diff = timeToDuration(timestamp);
    var hours = Math.floor(diff / 3600);
    var minutes = Math.floor(diff / 60) % 60;
    var seconds = Math.floor(diff) % 60;
    if (hours > 0) {
      if (minutes > 0) {
        return `${hours}h ${minutes}m`;
      } else {
        return `${hours}h`;
      }
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else if (seconds > 0) {
      return `${seconds}s`;
    } else {
      return 'now';
    }
  };

  const distanceToString = kilometers => {
    // show in miles if less than 1 mile, otherwise show in feet
    var miles = kilometers * 0.621371;
    if (miles < 1) {
      return `${Math.round(miles * 5280)} ft`;
    } else {
      return `${Math.round(miles * 10) / 10} mi`;
    }
  };

  const [shuttleData, setShuttleData] = useState(null);

  useEffect(() => {
    if (ux === 'callcenter') {
      const fetchData = () => {
        try {
          mobility.skids.trips.get('5da89172-056f-47c9-bef9-adf408bb587e', 'A1', 'COMPLETE_TRIP')
            .then((result) => {
              console.log('result', result);
              let fc = {
                type: 'FeatureCollection',
                features: [],
              };
              if (result && result.vehicles && result.vehicles.length) {
                const vehicle = result.vehicles[0];
                const coordinates = vehicle.location ? vehicle.location.coordinates : vehicle.coordinates;
                fc.features.push({
                  type: 'Feature',
                  geometry: {
                    type: 'Point',
                    coordinates,
                  },
                });
                geocoder.reverse({ lat: coordinates[1], lng: coordinates[0] })
                  .then((results) => {
                    fc.features[0].properties = results.length && results.length > 0 ? results[0] : { title: 'Unknown' };
                    fc.features[0].properties.icon = 'shuttle-live';
                    setShuttleData(fc);
                    updateShuttle(fc);
                  })
                  .catch((e) => {
                    console.log('geocoder error', e);
                  });
              }
              else {
                setShuttleData(fc);
                updateShuttle(fc);
              }
            })
            .catch((e) => {
              console.log('skids trips error', e);
            });
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();

      const intervalId = setInterval(fetchData, 10000);

      return () => clearInterval(intervalId);
    }
  }, []);

  return (
    <>
      {!stoptimes?.features.length && routes.length > 0 ? (
        <Flex
          position={'relative'}
          mt={2}
          flexDir={'column'}
          overflowX={'auto'}
          // flexWrap={'wrap'}
          id="map-route-list"
          data-testid="map-route-list"
        >
          {routes.map((r, i) => {
            // console.log('route', r);
            if (r.mode === 'shuttle' && ux === 'callcenter') {
              return (
                <Box
                  key={i}
                  background={`#${r.color || 'brand'}`}
                  color={`#${r.textColor || 'ffffff'}`}
                  outline={'solid 1px white'}
                  display={'block'}
                  paddingY={'16px'}
                  paddingX={'8px'}
                  fontSize="sm"
                  fontWeight="bold"
                  height={'unset'}
                  margin={0}
                  borderRadius={0}
                  width={'100%'}
                  whiteSpace={'normal'}
                >
                  <Text fontSize={18} textAlign={'left'}>
                    {r.name}
                  </Text>
                  <Divider mt={2} mb={2} />
                  <Text fontSize={16} textAlign={'left'}>Current Location</Text>
                  {shuttleData && shuttleData.features.length > 0 &&
                    <Text mt={2} fontSize={16} textAlign={'left'}>{shuttleData.features[0].properties.title}</Text>
                  }
                  {shuttleData && shuttleData.features.length === 0 &&
                    <Text mt={2} fontSize={16} textAlign={'left'}>Unknown</Text>
                  }
                </Box>
              );
            }
            else {
              return (
                <Button
                  key={i}
                  data-testid="map-route-list-button"
                  onClick={() => routeClickHandler(r)}
                  background={`#${r.color || 'brand'}`}
                  color={`#${r.textColor || 'ffffff'}`}
                  _hover={{
                    filter: 'brightness(1.1) saturate(1.3)',
                  }}
                  outline={'solid 1px white'}
                  display={'block'}
                  paddingY={'16px'}
                  paddingX={'8px'}
                  fontSize="sm"
                  fontWeight="bold"
                  height={'unset'}
                  margin={0}
                  borderRadius={0}
                  width={'100%'}
                  whiteSpace={'normal'}
                >
                  {r.mode === 'bus' && (
                    <>
                      <Flex
                        flexDir={'row'}
                        justifyContent={'space-between'}
                        width={'100%'}
                      // whiteSpace={'normal'}
                      >
                        <Heading as="h3" className="route-list-heading">
                          {r?.route?.subRoute}
                        </Heading>
                        <Flex flexDir={'column'}>
                          <Box style={{ textAlign: 'right' }}>
                            {r?.route?.arrive
                              ? durationToString(r.route.arrive)
                              : ''}
                          </Box>
                          <Box style={{ textAlign: 'right' }}>
                            {r?.route?.arriveNext
                              ? `${t('global.next')} ${moment(
                                r.route.arriveNext
                              ).format('h:mm A')}`
                              : ''}
                          </Box>
                        </Flex>
                      </Flex>
                      {(r?.route || r?.location) && (
                        <Flex flexDir={'column'} flex={1}>
                          {r?.route && (
                            <Box
                              as="span"
                              style={{
                                fontSize: 14,
                                textAlign: 'left',
                                marginBottom: 4,
                              }}
                            >
                              {r.route?.destination}
                            </Box>
                          )}
                          {r?.location && (
                            <span style={{ textAlign: 'left' }}>
                              {t('routeList.stop')}{' '}
                              <span
                                style={{
                                  color: `#${r.color || '004490'}`,
                                  backgroundColor: `#${r.textColor || 'ffffff'}`,
                                  borderRadius: 4,
                                  padding: '0px 4px',
                                }}
                              >
                                {r.location?.publicCode}
                              </span>{' '}
                              {r.location?.name}
                              {r?.kilometers && (
                                <span>
                                  {' ('}
                                  {distanceToString(r?.kilometers)}
                                  {') '}
                                </span>
                              )}
                            </span>
                          )}
                        </Flex>
                      )}
                    </>
                  )}

                  {r.mode === 'shuttle' && (ux === 'kiosk' || ux === 'callcenter') && (
                    <Flex flexDirection={'column'} flex={1}>
                      <span style={{ fontSize: 18, textAlign: 'left' }}>
                        {r.name}
                      </span>
                    </Flex>
                  )}
                </Button>
              );
            }
          })}
        </Flex>
      ) : (
        ''
      )}
    </>
  );
});

// function formatStopTime(time) {
//   const now = Date.now();
//   const date = new Date(time);
//   return Number((date - now) / 1000 / 60).toFixed(0) > 1
//     ? [Number((date - now) / 1000 / 60).toFixed(0), 'minutes']
//     : ['< 1', 'minute'];
// }
