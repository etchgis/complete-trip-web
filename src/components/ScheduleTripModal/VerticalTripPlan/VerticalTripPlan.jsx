import * as polyline from '@mapbox/polyline';

import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Center,
  Divider,
  Flex,
  Grid,
  Heading,
  Icon,
  Image,
  Text,
  VStack,
  useColorMode,
} from '@chakra-ui/react';
import { FaGenderless, FaStar } from 'react-icons/fa';

import CreateIcon from '../../CreateIcon';
import { FaArrowRight } from 'react-icons/fa';
import { RxDotFilled } from 'react-icons/rx';
import config from '../../../config';
import { fillGaps } from '../../../utils/tripplan';
import formatters from '../../../utils/formatters';
import simplify from 'simplify-geojson';
import { theme } from '../../../theme';
import { useState } from 'react';
import { useStore } from '../../../context/RootStore';

// import sampleTrip from '../ScheduleTrip/sample-trip.json';

const TimelineStep = ({ start, label, steps }) => {
  const { colorMode } = useColorMode();
  const [showDetails, setShowDetails] = useState(false);
  const details =
    !steps || !steps.length
      ? []
      : showDetails
        ? [{ name: start }, ...steps]
        : [{ name: start }, { name: label }, steps[steps.length - 1]];
  const accentColor = colorMode === 'light' ? '#00205b' : 'gray.400';
  return (
    <Box style={{ margin: '10px 0 10px 10px' }} id="box">
      <VStack pos={'relative'} align={'start'}>
        {details.map((step, i) => (
          <Box key={i.toString()} display="flex" alignItems="center" mb={0}>
            {!showDetails ? (
              <Box
                display="flex"
                alignItems="center"
                pos={'absolute'}
                left={'3px'}
                top={'8px'}
                height={'30px'}
                borderLeft="solid 4px #00205b"
                borderColor={accentColor}
              ></Box>
            ) : null}
            {i > 0 && i < details.length - 1 ? (
              <Box
                display="flex"
                alignItems="center"
                pos={'absolute'}
                left={'3px'}
                height={'60px'}
                borderLeft="solid 4px #00205b"
                borderColor={accentColor}
              ></Box>
            ) : null}

            {details.length === 3 && i === 1 && !showDetails ? (
              <Box ml={6}>
                {/* TODO convert this to a button for accessibility */}
                <Text
                  fontWeight="bold"
                  fontSize="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  textDecoration={'underline'}
                  color="rgb(36, 101, 177)"
                  cursor={'pointer'}
                >
                  {step.name}
                </Text>
              </Box>
            ) : (
              <>
                <Box
                  borderRadius="full"
                  bg={
                    i === details.length - 1
                      ? accentColor
                      : colorMode === 'light'
                        ? '#fff'
                        : 'gray.800'
                  }
                  outline="solid 4px #00205b"
                  outlineColor={accentColor}
                  w={'10px'}
                  h={'10px'}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mr={'10px'}
                  zIndex={1}
                ></Box>
                <Box>
                  <Text
                    fontWeight="bold"
                    fontSize="sm"
                    opacity={!i || i === details.length - 1 ? 1 : 0.7}
                  >
                    {step.name}
                  </Text>
                </Box>
              </>
            )}
          </Box>
        ))}
        {showDetails ? (
          <Text
            fontWeight="bold"
            fontSize="sm"
            onClick={() => setShowDetails(!showDetails)}
            textDecoration={'underline'}
            color="rgb(36, 101, 177)"
            cursor={'pointer'}
          >
            {' '}
            Hide Details
          </Text>
        ) : null}
      </VStack>
    </Box>
  );
};

export const VerticalTripPlan = ({ request, plan }) => {
  // console.log({ request });
  // console.log({ plan });
  const { colorMode } = useColorMode();
  const planLegs = fillGaps(plan.legs);
  const features = [];
  planLegs.forEach(v =>
    v?.legGeometry?.points
      ? features.push(polyline.toGeoJSON(v?.legGeometry?.points))
      : null
  );
  // const geojson = simplify(
  //   {
  //     type: 'Feature',
  //     properties: {
  //       'stroke-width': 4,
  //       stroke: '#02597E',
  //     },
  //     geometry: {
  //       type: 'LineString',
  //       coordinates: features.reduce((a, f) => [...a, ...f.coordinates], []),
  //     },
  //   },
  //   0.001
  // );
  const geojson = {
    type: 'Feature',
    properties: {
      'stroke-width': 4,
      stroke: '#02597E',
    },
    geometry: {
      type: 'LineString',
      coordinates: features.reduce((a, f) => [...a, ...f.coordinates], []),
    },
  };
  return (
    <Grid
      gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }}
      gap={4}
      position="relative"
      data-testid="vertical-trip-plan"
    >
      <Box
        position={'relative'}
        width={{ base: '100%', md: '324px' }}
        maxW="100%"
      >
        <Center>
          <Heading as="h3" size="md" mb={2}>
            {new Date(plan.startTime).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Heading>
        </Center>
        <Flex
          position="absolute"
          zIndex={2}
          w={{ base: '100%', md: '100%' }}
          maxW="540px"
        >
          <Grid
            borderRadius={'2xl'}
            h="80px"
            w="80%"
            // background={
            //   'linear-gradient(90deg, hsl(202deg 100% 60%), hsl(240deg 46% 61%) 100%)'
            // }
            backgroundColor={'trip'}
            mt={'40px'}
            mx="auto"
            px={2}
            py={4}
            color={'white'}
            gridTemplateColumns={'1fr 1fr 1fr'}
            gap={0}
          >
            <Box textAlign="center">
              <Text fontSize={'sm'}>Leave</Text>
              <Box>
                {formatters.datetime
                  .asHMA(new Date(plan?.startTime))
                  .replace('am', '')
                  .replace('pm', '')}
                <sub style={{ textTransform: 'uppercase' }}>
                  {' '}
                  {formatters.datetime
                    .asHMA(new Date(plan?.startTime))
                    .slice(-2)}
                </sub>
              </Box>
            </Box>

            <Flex alignItems={'center'} justifyContent={'center'}>
              <Center
                background={'rgba(255,255,255,0.5)'}
                h={10}
                w={10}
                borderRadius="lg"
              >
                <Icon as={FaArrowRight} color={'white'} />
              </Center>
            </Flex>

            <Box textAlign="center" mx={2} boxShadow={'md'}>
              <Text fontSize={'sm'}>Arrive</Text>
              <Box>
                {formatters.datetime
                  .asHMA(new Date(plan?.endTime))
                  .replace('am', '')
                  .replace('pm', '')}
                <sub style={{ textTransform: 'uppercase' }}>
                  {' '}
                  {formatters.datetime.asHMA(new Date(plan?.endTime)).slice(-2)}
                </sub>
              </Box>
            </Box>
          </Grid>
        </Flex>
        <Image
          src={`https://api.mapbox.com/styles/v1/${config.MAP.BASEMAPS.DAY.replace(
            'mapbox://styles/',
            ''
          )}/static/geojson(${encodeURIComponent(
            JSON.stringify(geojson)
          )})/auto/540x960?padding=120,20,20,20&before_layer=waterway-label&access_token=${config.MAP.MAPBOX_TOKEN
            }`}
          alt="map"
          borderRadius={'md'}
          margin={{ base: '60px 0', md: 'calc(calc(100% - 200px) / 2) 0' }}
        />
      </Box>
      <Card
        size={{ base: 'lg', lg: 'lg' }}
        borderRadius={'md'}
        background={colorMode === 'light' ? 'white' : 'gray.800'}
      >
        <CardHeader pb={0}>
          {/* <Heading size="md" as="h3" mb={2}>
            Trip Plan
          </Heading> */}
          <Text>{request?.destination?.title}</Text>
          <Text>{request?.destination?.description}</Text>
        </CardHeader>
        <CardBody fontWeight={'bold'} py={2}>
          <VerticalTripPlanDetail request={request} plan={plan} />
        </CardBody>
      </Card>
    </Grid>
  );
};

const VerticalTripPlanDetail = ({ request, plan }) => {
  const { colorMode } = useColorMode();
  const { user } = useStore().authentication;
  const { wheelchair } = user?.profile?.preferences || false;
  // const hasHours = Math.round(plan.duration / 60) / 60 > 1;
  const planLegs = fillGaps(plan.legs);

  return (
    <Box>
      <Flex alignItems={'center'}>
        <Text mr={1} fontSize={'sm'}>
          {formatters.datetime.asDuration(plan.duration)} (
          {formatters.distance.asMiles(
            plan.legs.reduce((acc, leg) => {
              return acc + leg.distance;
            }, 0)
          )}
          )
        </Text>
        <Icon as={RxDotFilled} fontSize={'lg'} />
        <Text fontSize={'sm'}>
          {plan.transfers + (plan.transfers === 1 ? ' transfer' : ' transfers')}
        </Text>
      </Flex>

      <Box py={2}>
        <Divider borderColor="tripDark" borderWidth={2} />
      </Box>

      <Flex display={'flex'} alignItems="center">
        <Icon as={FaGenderless} boxSize={6} mr={1} ml={-1} />
        <Text p={0} mr={1}>
          Leave By
        </Text>
        <Box as="span">
          {formatters.datetime
            .asHMA(new Date(plan?.startTime))
            .replace('am', '')
            .replace('pm', '')}
          <sub style={{ textTransform: 'uppercase' }}>
            {' '}
            {formatters.datetime.asHMA(new Date(plan?.startTime)).slice(-2)}
          </sub>
        </Box>
      </Flex>
      <Box py={2}>
        <Divider />
      </Box>
      <Box>
        {plan.legs.map((leg, i) => {
          let title = formatLegTitle(leg, wheelchair);
          let name = getLegModeName(leg, wheelchair);
          const mode =
            title === 'WAIT'
              ? config.WAIT
              : name.toLowerCase() === 'roll'
                ? config.WHEELCHAIR
                : config.MODES.find(m => m.id === name);
          // console.log(name, title, mode);
          if (name === 'scooter') {
            // later
          } else if (name === 'bus') {
            title += ' (' + leg.mode.toLowerCase() + ')';
          }

          let route, headsign;
          if (leg.agencyName && leg.route) {
            route = leg.route;
            headsign = leg.headsign;
          }

          let fillColor = getLegColor(leg);
          if (fillColor === '#FFFFFF') {
            fillColor = theme.colors.primary1;
          }

          let intermediateStopsLabel;

          if (leg.intermediateStops && leg.intermediateStops.length > 0) {
            const lbl =
              leg.intermediateStops.length +
              ' stop' +
              (leg.intermediateStops.length === 1 ? '' : 's');
            const dur = formatters.datetime.asDuration(leg.duration);
            intermediateStopsLabel = `${lbl}, ${dur}`;
          }

          // let fromFontSize = 10,
          //   fromFill = '#111111',
          //   fromWeight = 'normal',
          //   toFontSize = 10,
          //   toFill = '#111111',
          //   toWeight = 'normal',
          //   toName = leg.to ? leg.to.name || '' : ' (YOUR STOP)';
          // if (leg?.intermediateStops) console.log(leg.intermediateStops.length);
          // const multiplier = 15.5;
          // console.log(leg?.intermediateStops);
          // console.log({ mode });

          return (
            <VStack
              key={i.toString()}
              alignItems={'flex-start'}
              spacing={1}
              borderBottom={
                i === planLegs.length - 1 ? 'none' : '1px solid #ddd'
              }
              borderColor={colorMode === 'light' ? 'gray.200' : 'gray.200'}
            >
              <Flex alignItems={'center'} mt={2}>
                {mode?.webIcon ? (
                  <Icon as={mode.webIcon} mr={2} />
                ) : mode?.svg ? (
                  CreateIcon(mode.svg)
                ) : null}
                <Text>{title}</Text>
              </Flex>
              <Box>
                {route && (
                  <>
                    <Text>{headsign}</Text>
                    <Text>{route}</Text>
                  </>
                )}
              </Box>
              {leg.intermediateStops ? (
                <TimelineStep
                  start={leg.from.name}
                  label={intermediateStopsLabel}
                  steps={leg.intermediateStops}
                />
              ) : null}
              <Box>
                <Divider />
              </Box>
            </VStack>
          );
        })}

        <Flex alignItems={'center'} my={4}>
          <Icon as={FaStar} mr={2} />
          <Text fontWeight={'bold'}>
            Arrive at {request?.destination?.title}{' '}
            {formatters.datetime
              .asHMA(new Date(planLegs[planLegs.length - 1].endTime))
              .replace('am', '')
              .replace('pm', '')}
            <sub style={{ textTransform: 'uppercase' }}>
              {' '}
              {formatters.datetime
                .asHMA(new Date(planLegs[planLegs.length - 1].endTime))
                .slice(-2)}
            </sub>
          </Text>
        </Flex>
      </Box>
    </Box>
  );
};

// function trimText(text, threshold) {
//   if (text.length <= threshold) {
//     return text;
//   }
//   return text.substr(0, threshold).concat('...');
// }

const formatLegTitle = (leg, wheelchair) => {
  if (leg.agencyId || leg.providerId) {
    return leg.agencyId || leg.providerId;
  }
  if (leg.mode === 'WALK' || leg.mode === 'CAR') {
    const duration = formatters.datetime.asDuration(leg.duration);
    let title = leg.mode === 'WALK' ? (wheelchair ? 'Roll' : 'Walk') : 'Drive';
    if (duration) {
      title += ' ' + duration;
    }
    return title;
  }
  return leg.mode;
};

const getLegModeName = (leg, wheelchair) => {
  var name = leg.mode.toLowerCase(); //(leg.agencyId || leg.providerId || leg.mode).toLowerCase();
  if (name === 'walk' && wheelchair) {
    return 'roll';
  }
  if (name === 'tram' || name === 'cable_car' || name === 'gondola') {
    return 'tram';
  }
  if (name === 'ferry') {
    return 'ship';
  }
  if (name === 'rail') {
    return 'train';
  }
  return name;
};

const getLegColor = leg => {
  var mode = '',
    color;
  if (
    ['tram', 'subway', 'rail', 'bus', 'ferry', 'cable_car', 'gondola'].indexOf(
      leg.mode.toLowerCase()
    ) > -1
  ) {
    mode = 'transit';
  } else if (leg.mode.toLowerCase() === 'bicycle') {
    mode = 'bike';
  } else {
    mode = leg.mode.toLowerCase();
  }
  config.MODES.forEach(m => {
    if (m.mode.toLowerCase() === mode) {
      color = m.color;
    }
  });
  const rColor = color || '#CCCCCC';
  leg.routeColor = rColor;
  return rColor;
};

/*

SVG STOPS
<Box>
  {intermediateStopsLabel && (
    <svg
      width={200}
      height={
        showDetails[i].showDetails
          ? 110 + leg.intermediateStops.length * multiplier
          : 110
      }
    >
      <circle
        cx={10}
        cy={20}
        r={6}
        stroke={fillColor}
        strokeWidth={4}
        fill={'#ffffff'}
      />
      <line
        x1={10}
        y1={26}
        x2={10}
        y2={40}
        stroke={fillColor}
        strokeWidth={4}
        strokeLinecap="round"
      />

      <line
        x1={10}
        y1={46}
        x2={10}
        y2={
          !showDetails[i].showDetails
            ? 66
            : 110 + leg.intermediateStops.length * multiplier - 48
        }
        stroke={fillColor}
        strokeWidth={4}
        strokeDasharray={
          !showDetails[i].showDetails ? [1, 6] : []
        }
        strokeLinecap="round"
      />

      <line
        x1={10}
        y1={
          !showDetails[i].showDetails
            ? 68
            : 110 + leg.intermediateStops.length * multiplier - 42
        }
        x2={10}
        y2={
          !showDetails[i].showDetails
            ? 82
            : 110 + leg.intermediateStops.length * multiplier - 28
        }
        stroke={fillColor}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <circle
        cx={10}
        cy={
          !showDetails[i].showDetails
            ? 92
            : 110 + leg.intermediateStops.length * multiplier - 19
        }
        r={6}
        stroke={fillColor}
        strokeWidth={4}
        fill={fillColor}
      />

      <text
        x={25}
        y={23}
        fill={fromFill}
        fontSize={fromFontSize}
        fontWeight={fromWeight}
      >
        {leg.from.name}
      </text>
      <text
        x={25}
        y={!showDetails[i].showDetails ? 56 : 36}
        fill={
          !showDetails[i].showDetails
            ? theme.colors.brand
            : '#111'
        }
        fontSize={toFontSize}
        fontWeight={toWeight}
        onClick={() =>
          setShowDetails(current => {
            current[i].showDetails = !current[i].showDetails;
            return [...current];
          })
        }
        cursor="pointer"
        textDecoration={
          !showDetails[i].showDetails ? 'underline' : 'none'
        }
      >
        {!showDetails[i].showDetails ? (
          <>{intermediateStopsLabel}</>
        ) : (
          <>
            {leg.intermediateStops.map((stop, i) => {
              return (
                <>
                  <circle
                    cx={5}
                    cy={0}
                    r={6}
                    stroke={fillColor}
                    strokeWidth={4}
                    fill={fillColor}
                  />
                  <tspan
                    x={25}
                    dy={16}
                    fill={toFill}
                    fontSize={toFontSize}
                    fontWeight={toWeight}
                    key={i.toString()}
                  >
                    {stop.name}
                  </tspan>
                </>
              );
            })}
          </>
        )}
      </text>
      <text
        x={25}
        y={
          !showDetails[i].showDetails
            ? 95
            : 110 + leg.intermediateStops.length * multiplier - 16
        }
        fill={toFill}
        fontSize={toFontSize}
        fontWeight={toWeight}
      >
        {toName}
      </text>
    </svg>
  )}
</Box>
*/
