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

export const DependentsTripsTable = observer(({ hideTitle, limit }) => {
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { dependentTrips } = useStore().schedule;
  const { isLoading } = useStore().uiStore;
  const { dependentTracker, resetMap } = useStore().tripMapStore;
  const [selectedTrip, setSelectedTrip] = useState({});
  const allTrips = toJS(dependentTrips);

  const trips = [];
  const tripCount = {};

  allTrips.forEach(trip => {
    if (!tripCount[trip.dependent]) tripCount[trip.dependent] = 0;
    if (tripCount[trip.dependent] < limit || !limit) {
      trips.push(trip);
      tripCount[trip.dependent] += 1;
    }
  });

  trips.sort((a, b) => {
    return new Date(a.plan.startTime) - new Date(b.plan.startTime);
  });

  const openVerticalTripPlan = trip => {
    dependentTracker.start(trip.dependent?.dependent);
    setSelectedTrip(trip);
    console.log({ trip });
    onOpen();
  };

  const backClickHandler = () => {
    dependentTracker.stop();
    resetMap();
    onClose();
    setSelectedTrip({});
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
                          {formatters.datetime.asDuration(trip?.plan?.duration)}
                        </Box>
                      </Td>
                      <Td>
                        {trip.dependent?.firstName} {trip.dependent?.lastName}
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
        isOpen={isOpen}
        onClose={backClickHandler}
        backClickHandler={backClickHandler}
      />
    </>
  );
});
