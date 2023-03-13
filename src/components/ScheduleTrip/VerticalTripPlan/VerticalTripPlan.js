import {
  Box,
  Divider,
  Flex,
  Icon,
  Text,
  VStack,
  useColorMode,
} from '@chakra-ui/react';
import { FaGenderless, FaStar } from 'react-icons/fa';

import config from '../../../config';
import { fillGaps } from '../../../utils/tripplan';
import formatters from '../../../utils/formatters';
import { theme } from '../../../theme';
import { useState } from 'react';
import { useStore } from '../../../context/RootStore';

// import sampleTrip from '../ScheduleTrip/sample-trip.json';

const styles = {};

// const timelineSteps = [
//   {
//     icon: FaCircle,
//     title: 'Step 1',
//     description: 'This is the description for step 1',
//   },
//   {
//     icon: FaBus,
//     title: 'Step 2',
//     description: 'This is the description for step 2',
//   },
//   {
//     icon: FaCar,
//     title: 'Step 3',
//     description: 'This is the description for step 3',
//   },
//   {
//     icon: FaWheelchair,
//     title: 'Step 3',
//     description: 'This is the description for step 3',
//   },
//   {
//     icon: FaTrain,
//     title: 'Step 3',
//     description: 'This is the description for step 3',
//   },
//   {
//     icon: FaCircle,
//     title: 'Step 4',
//   },
// ];

// const TimelineStep = ({ step, title, hideDivider }) => {
//   const IconComponent = step.icon;
//   return (
//     <HStack align="top">
//       <Box>
//         <Icon as={IconComponent} mt={1} />
//         {hideDivider ? null : (
//           <Center height="50px">
//             <Divider orientation="vertical" />
//           </Center>
//         )}
//       </Box>
//       <VStack align="start">
//         <Text fontWeight="bold">{title}</Text>
//         {step.description ? <Text>{step.description}</Text> : null}
//       </VStack>
//     </HStack>
//   );
// };

export const VerticalTripPlan = ({ plan }) => {
  const { colorMode } = useColorMode();
  const { trip } = useStore();
  const { user } = useStore().authentication;
  const { wheelchair } = user?.profile?.preferences || false;
  const hasHours = Math.round(plan.duration / 60) / 60 > 1;
  const planLegs = fillGaps(plan.legs);
  const [showDetails, setShowDetails] = useState(
    plan.legs.reduce((acc, leg) => {
      return [
        ...acc,
        {
          intStops: leg.intermediateStops && leg.intermediateStops.length > 0,
          showDetails: false,
        },
      ];
    }, [])
  );

  return (
    <Box>
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
      <Flex
      // style={Containers.row}
      >
        <Text
          style={{
            ...styles.selectedPlanTime,
            fontSize: hasHours ? 18 : 22,
          }}
          mr={1}
        >
          {formatters.datetime.asDuration(plan.duration)}
        </Text>
        <Text
          fontSize={hasHours ? 18 : 22}
          style={{
            ...styles.selectedPlanDistance,
          }}
        >
          (
          {formatters.distance.asMiles(
            plan.legs.reduce((acc, leg) => {
              return acc + leg.distance;
            }, 0)
          )}
          )
        </Text>
        {/* <Box style={{ flex: 1, alignItems: 'flex-end' }}>
          <svg width={30} height={25}>
            <G>{weatherIcon}</G>
          </svg>
        </Box> */}
      </Flex>
      <Text style={styles.selectedPlanTransfers}>
        {plan.transfers + (plan.transfers === 1 ? ' transfer' : ' transfers')}
      </Text>
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

          let fromFontSize = 10,
            fromFill = '#111111',
            fromWeight = 'normal',
            toFontSize = 10,
            toFill = '#111111',
            toWeight = 'normal',
            toName = leg.to ? leg.to.name || '' : ' (YOUR STOP)';
          if (leg?.intermediateStops) console.log(leg.intermediateStops.length);
          const multiplier = 15.5;
          console.log(leg?.intermediateStops);
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
                <Icon as={mode.webIcon} mr={2} />
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

              <Box>
                <Divider />
              </Box>
            </VStack>
          );
        })}

        {/* {planLegs.map((leg, i) => {
          var duration = formatters.datetime.asDuration(leg.duration);
          var time = formatters.datetime.asHMA(new Date(leg.startTime));
          var delay = 'on time',
            realtime = false;
          var title = formatLegTitle(leg, wheelchair);
          var name = getLegModeName(leg, wheelchair);
          var price = leg.price ? (leg.price || 0) / 100 : null;
          var route, headsign;
          // if (leg.agencyName && leg.route) {
          //   route = leg.route;
          //   headsign = leg.headsign;
          //   var maxPixels = SCREEN.width - (x1 + 20),
          //     charPixels = (headsign?.length || 0) * PIXELS_PER_CHAR,
          //     estChars = maxPixels / PIXELS_PER_CHAR;
          //   if (charPixels > maxPixels) {
          //     headsign = trimText(headsign, estChars);
          //   }
          // }
          var noScooters;

          if (name === 'bus') {
            title += ' (' + leg.mode.toLowerCase() + ')';
          }

          var lastSeparator, endTitle, endTime;
          if (i === planLegs.length - 1) {
            // lastSeparator = drawLine(
            //   0,
            //   y2,
            //   gWidth - 2 * VerticalPlanSchedule.Margin,
            //   y2
            // );
            endTitle = 'Destination'; //translator.translate("components.verticalPlanSchedule.destination")
            endTime = formatters.datetime.asHMA(new Date(leg.endTime));
          }
          var intermediateStops;
          if (leg.intermediateStops && leg.intermediateStops.length > 0) {
            intermediateStops = leg.intermediateStops.map((stop, j) => {
              var sTitle = stop.name || '';
            });
          }
          return (
            <Box as="pre">
              Stop ID: {leg?.to?.stopId} <br />
              Stop Code: {leg?.to?.stopCode} <br />
              Start: {formatters.datetime.asHMA(new Date(leg.startTime))} <br />
              Arrive: {formatters.datetime.asHMA(new Date(leg.endTime))}
              <br />
              Mode: {leg.mode}
              <br />
              Distance: {formatters.distance.asMiles(leg.distance)}
              <br />
              Duration: {formatters.datetime.asDuration(leg.duration)} <br />
              {leg.steps ? 'Steps: ' : null}
              {leg.steps
                ? leg.steps.map(s => (
                    <Text as="pre">{JSON.stringify(s, 0, 2)}</Text>
                  ))
                : null}
              <Box py={5}>
                <Divider />
              </Box>
            </Box>
          );
        })} */}
        <Flex alignItems={'center'} my={4}>
          <Icon as={FaStar} mr={2} />
          <Text fontWeight={'bold'}>
            Arrive at {trip?.request?.destination?.title}{' '}
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
        {/* <Text as="pre">{JSON.stringify(toJS(planLegs[0]), 0, 2)}</Text> */}
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
