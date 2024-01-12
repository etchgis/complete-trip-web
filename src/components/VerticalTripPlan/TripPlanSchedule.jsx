import {
  Box,
  Center,
  Divider,
  Flex,
  Grid,
  Heading,
  Icon,
  Text,
  VStack,
  createIcon,
  useColorMode,
} from '@chakra-ui/react';
import { FaArrowRight, FaCircle, FaStar } from 'react-icons/fa';
import { useEffect, useState } from 'react';

import { RxDotFilled } from 'react-icons/rx';
import config from '../../config';
import { fillGaps } from '../../utils/tripplan';
import formatters from '../../utils/formatters';
import { observer } from 'mobx-react-lite';
import { theme } from '../../theme';
// import { toJS } from 'mobx';
import { useStore } from '../../context/RootStore';

// import sampleTrip from '../ScheduleTrip/sample-trip.json';

const Circle = createIcon({
  displayName: 'Circle',
  viewBox: '0 0 512 512',
  path: [
    <path
      d="M256 8C119.033 8 8 119.033 8 256s111.033 248 248 248 248-111.033 248-248S392.967 8 256 8zm80 248c0 44.112-35.888 80-80 80s-80-35.888-80-80 35.888-80 80-80 80 35.888 80 80z"
      transform="matrix(1, 0, 0, 1, -7.105427357601002e-15, 0)"
      fill="currentColor"
    />,
    <ellipse
      fill="white"
      cx="254.018"
      cy="256.512"
      rx="81.83"
      ry="81.83"
      transform="matrix(1, 0, 0, 1, -7.105427357601002e-15, 0)"
    />,
  ],
});

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
                height={'10px'}
                borderLeft="dashed 4px #00205b"
                borderColor={accentColor}
              ></Box>
            ) : null}
            {i > 0 && i < details.length - 1 ? (
              <Box
                display="flex"
                alignItems="center"
                pos={'absolute'}
                left={'3px'}
                height={showDetails ? '60px' : '40px'}
                borderLeft="solid 4px #00205b"
                borderColor={accentColor}
              ></Box>
            ) : null}
            {i === details.length - 1 ? (
              <Box
                display="flex"
                alignItems="center"
                pos={'absolute'}
                left={'3px'}
                bottom={'-25px'}
                height={'30px'}
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
                  color={colorMode === 'light' ? 'brand' : 'theme.light'}
                  cursor={'pointer'}
                  data-name="step-name"
                >
                  {step.name}
                </Text>
              </Box>
            ) : (
              <>
                <Icon
                  as={i === details.length - 1 ? FaCircle : Circle}
                  color={accentColor}
                  style={{
                    marginLeft: i === details.length - 1 ? '-4px' : '-5px',
                    marginRight: '10px',
                    zIndex: 2,
                  }}
                  fontSize={i === details.length - 1 ? '18px' : '20px'}
                />
                {/* <Box
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
                ></Box> */}
                <Box>
                  <Text
                    fontWeight="bold"
                    fontSize="sm"
                    opacity={!i || i === details.length - 1 ? 1 : 0.7}
                    data-name="step-name"
                  >
                    {step.name}
                  </Text>
                </Box>
              </>
            )}
          </Box>
        ))}
        {showDetails ? (
          <>
            <Box
              display="flex"
              alignItems="center"
              pos={'absolute'}
              bottom={0}
              left={'3px'}
              height={'40px'}
              borderLeft="solid 4px #00205b"
              borderColor={accentColor}
            ></Box>
            <Text
              fontWeight="bold"
              fontSize="sm"
              onClick={() => setShowDetails(!showDetails)}
              textDecoration={'underline'}
              color={colorMode === 'light' ? 'brand' : 'theme.light'}
              cursor={'pointer'}
              pl={'24px'}
            >
              Hide Details
            </Text>
          </>
        ) : null}
      </VStack>
    </Box>
  );
};

const CreateCircleIcon = ({ svg, backgroundColor }) => {
  return (
    <Flex
      w={7}
      h={7}
      mr={2}
      ml={'1px'}
      justifyContent={'center'}
      alignItems={'center'}
      backgroundColor={backgroundColor || 'red'}
      borderRadius={'full'}
    >
      <Icon viewBox={svg?.viewBox || '0 0 512 512'} boxSize={'5'}>
        <path
          fill={backgroundColor === 'gray.400' ? 'black' : 'white'}
          d={
            svg?.path ||
            'M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0'
          }
        />
      </Icon>
    </Flex>
  );
};

export const TripPlanSchedule = observer(
  ({ tripRequest: request, tripPlan: plan, rider }) => {
    const { colorMode } = useColorMode();
    const { user } = useStore().authentication;
    const { activeLegIndex } = useStore().tripMapStore;
    const [legIndex, setL] = useState(-1);
    const riderProfile = rider?.profile ? JSON.parse(rider.profile) : false;
    const wheelchair =
      riderProfile?.preferences?.wheelchair ||
      user?.profile?.preferences?.wheelchair ||
      false;
    // console.log(toJS(plan));
    // console.log(toJS(request));
    const planLegs = plan?.legs?.length ? fillGaps(plan.legs) : [];

    useEffect(() => {
      // console.log('activeLegIndex', activeLegIndex);
      if (activeLegIndex !== legIndex) {
        setL(activeLegIndex);
      }
    }, [activeLegIndex]);

    return (
      <>
        {plan && plan?.legs?.length ? (
          <Box
            px={4}
            flex={1}
            id="trip-plan-schedule"
            data-testid="trip-plan-schedule"
          >
            <Grid
              gridTemplateColumns={'1fr 1fr 1fr'}
              width="80%"
              margin="10px auto 20px auto"
              py={2}
              fontWeight={'bold'}
              border="solid thin lightgray"
              borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
              borderRadius="md"
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
                <Center h={10} w={10} borderRadius="lg">
                  <Icon
                    as={FaArrowRight}
                    color={colorMode === 'light' ? 'brand' : 'theme.light'}
                  />
                </Center>
              </Flex>

              <Box textAlign="center" mx={2}>
                <Text fontSize={'sm'}>Arrive</Text>
                <Box>
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
                </Box>
              </Box>
            </Grid>

            <Text textAlign={'left'} data-name="to">
              To{' '}
              <strong>
                {request?.destination?.title}{' '}
                {request?.destination?.description}
              </strong>
            </Text>

            <Flex alignItems={'center'} mx={0} data-name="transfers">
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
                {plan.transfers +
                  (plan.transfers === 1 ? ' transfer' : ' transfers')}
              </Text>
            </Flex>

            <Box pt={4} pb={0} mb={-2}>
              <Divider
                borderColor={colorMode === 'light' ? 'brand' : 'theme.light'}
                borderWidth={2}
              />
            </Box>

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
                  fillColor = theme.colors.brand;
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
                const accentColor =
                  mode.mode === 'walk' ? 'gray.400' : mode.color;
                return (
                  <VStack
                    pos={'relative'}
                    key={i.toString()}
                    alignItems={'flex-start'}
                    spacing={1}
                    borderBottom={
                      i === planLegs.length - 1 ? 'none' : '1px solid #ddd'
                    }
                    borderColor={
                      colorMode === 'light' ? 'gray.200' : 'gray.600'
                    }
                    filter={
                      legIndex !== -1 && legIndex === i
                        ? 'opacity(1)'
                        : legIndex === -1
                        ? 'unset'
                        : 'opacity(0.5)'
                    }
                  >
                    <Flex alignItems={'center'} mt={2}>
                      {mode?.svg
                        ? CreateCircleIcon({
                            svg: mode.svg,
                            backgroundColor: accentColor,
                          })
                        : null}
                      <Heading
                        as="h3"
                        size="md"
                        m={0}
                        fontWeight={'extrabold'}
                        data-name="route-or-title"
                      >
                        {route || title}
                      </Heading>
                    </Flex>
                    <Box>
                      {route ? (
                        <>
                          <Box
                            display="flex"
                            alignItems="center"
                            pos={'absolute'}
                            left={'13px'}
                            top={'36px'}
                            height={'100%'}
                            borderLeft="solid 4px #00205b"
                            borderStyle={
                              mode.mode === 'walk' ? 'dashed' : 'solid'
                            }
                            borderColor={accentColor}
                          ></Box>
                          <Box ml={'36px'}>
                            <Text
                              fontWeight={'semibold'}
                              fontSize={'xs'}
                              data-name="headsign"
                              textAlign={'left'}
                            >
                              To {headsign}
                            </Text>
                            <Text
                              fontWeight={'black'}
                              fontSize={'sm'}
                              textTransform={'uppercase'}
                              color={
                                colorMode === 'light' ? 'brand' : 'theme.light'
                              }
                              data-name="leg-to-name"
                              textAlign={'left'}
                            >
                              {leg?.to?.name}
                            </Text>
                          </Box>
                        </>
                      ) : (
                        <>
                          {i < plan.legs.length - 1 && (
                            <Box
                              display="flex"
                              alignItems="center"
                              pos={'absolute'}
                              left={'13px'}
                              top={'36px'}
                              height={'20px'}
                              borderLeft="solid 4px #00205b"
                              borderStyle={
                                mode.mode === 'walk' ? 'dashed' : 'solid'
                              }
                              borderColor={accentColor}
                            ></Box>
                          )}
                        </>
                      )}
                    </Box>
                    {leg.intermediateStops ? (
                      <>
                        <TimelineStep
                          start={leg.from.name}
                          label={intermediateStopsLabel}
                          steps={leg.intermediateStops}
                        />
                      </>
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
        ) : (
          ''
        )}
      </>
    );
  }
);

{
  /* MAP SECTION */
}

{
  /* HEADING */
}
{
  /* <Center>
          <Heading as="h3" size="md" mb={2}>
            {new Date(plan.startTime).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Heading>
        </Center> */
}

{
  /* TO FROM */
}
{
  /* <Flex
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
            mt={'20px'}
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

            <Box textAlign="center" mx={2}>
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
        </Flex> */
}

{
  /* MAP */
}
{
  /* <Flex flex={1}>
          <TripPlanMap geojson={featureCollection} />
        </Flex> */
}
{
  /* <Image
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
        /> */
}

{
  /* PLAN SECTION */
}

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
