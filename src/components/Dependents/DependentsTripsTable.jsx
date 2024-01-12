import {
  Box,
  Heading,
  Icon,
  IconButton,
  Table,
  Tbody,
  Td,
  Tr,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';

import { ChevronRightIcon } from '@chakra-ui/icons';
import { RxDotFilled } from 'react-icons/rx';
import { TripPlanStandaloneModal } from '../VerticalTripPlan/TripPlanStandaloneModal';
import formatters from '../../utils/formatters';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { useState } from 'react';
import { useStore } from '../../context/RootStore';

export const DependentsTripsTable = observer(
  ({ dependent, hideTitle, limit }) => {
    const { colorMode } = useColorMode();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { dependentTrips } = useStore().schedule;
    const { isLoading } = useStore().uiStore;
    const { dependentTracker, resetMap, setActiveTripId } =
      useStore().tripMapStore;
    const [selectedTrip, setSelectedTrip] = useState({});
    const allTrips = toJS(dependentTrips);

    const now = Date.now();
    const filteredTrips = allTrips.filter(
      trip => new Date(trip.plan.endTime) > now
    );
    filteredTrips.map(
      t =>
        (t.plan.endTimeText = formatters.datetime.asHHMMA(
          new Date(t.plan.endTime)
        ))
    );
    console.log({ filteredTrips });

    const stagedTrips = [];
    const tripCount = {};

    filteredTrips.forEach(trip => {
      // console.log({ trip });
      if (!tripCount[trip.dependent.dependent])
        tripCount[trip.dependent.dependent] = 0;
      if (tripCount[trip.dependent.dependent] < limit || !limit) {
        stagedTrips.push(trip);
        // console.log({ trip });
        tripCount[trip.dependent.dependent] += 1;
      }
    });
    // console.log('[dependent-trips-table]', limit, tripCount);

    const trips = dependent
      ? stagedTrips.filter(t => t.dependent.id === dependent)
      : stagedTrips;

    trips.sort((a, b) => {
      return new Date(a.plan.startTime) - new Date(b.plan.startTime);
    });

    const openVerticalTripPlan = trip => {
      dependentTracker.start(trip.dependent?.dependent);
      setSelectedTrip(trip);
      console.log({ trip });
      setActiveTripId(trip?.id);
      onOpen();
    };

    const backClickHandler = () => {
      dependentTracker.stop();
      resetMap();
      onClose();
      setSelectedTrip({});
      setActiveTripId(null);
    };

    //ACCORDION
    return (
      <>
        <Box>
          {!hideTitle && (
            <Heading as="h2" size="md">
              Upcoming Dependent Trips
            </Heading>
          )}
          {!isLoading && !trips.length && <p>No trips found.</p>}
          {!trips.length ? (
            ''
          ) : (
            <Box
              border={limit ? 'solid thin lightgray' : 'none'}
              borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
            >
              <Table
                size="md"
                className="dependent-trip-list-table"
                fontSize={'md'}
              >
                <Tbody>
                  {trips.map((trip, i) =>
                    i > (limit || 10000) ? (
                      ''
                    ) : (
                      <Tr key={i.toString()}>
                        <Td fontWeight={'bold'} textTransform={'uppercase'}>
                          {formatters.datetime
                            .asMD(new Date(trip?.plan?.startTime))
                            .join(' ')}
                        </Td>
                        <Td>{trip?.destination}</Td>
                        <Td>
                          <Box
                            fontSize={'xs'}
                            display={'flex'}
                            flexDir={'row'}
                            alignItems={'center'}
                          >
                            {formatters.datetime.asHHMMA(
                              new Date(trip?.plan?.startTime)
                            )}{' '}
                            -{' '}
                            {formatters.datetime.asHHMMA(
                              new Date(trip?.plan?.endTime)
                            )}
                            <Icon as={RxDotFilled} fontSize={'lg'} />
                            {formatters.datetime.asDuration(
                              trip?.plan?.duration
                            )}
                          </Box>
                        </Td>
                        <Td>
                          {dependent
                            ? ''
                            : `${trip.dependent?.firstName} ${trip.dependent?.lastName}`}
                        </Td>
                        <Td>
                          <IconButton
                            icon={<ChevronRightIcon />}
                            variant={'ghost'}
                            onClick={() => openVerticalTripPlan(trip)}
                          />
                        </Td>
                      </Tr>
                    )
                  )}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>
        <TripPlanStandaloneModal
          plan={selectedTrip?.plan}
          request={selectedTrip?.plan?.request}
          rider={selectedTrip?.rider}
          isOpen={isOpen}
          onClose={backClickHandler}
          backClickHandler={backClickHandler}
          title={`Tracking ${selectedTrip?.dependent?.firstName} ${selectedTrip?.dependent?.lastName}'s Trip`}
        />
      </>
    );
  }
);
