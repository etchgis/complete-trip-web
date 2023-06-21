import {
  Box,
  Heading,
  IconButton,
  Table,
  Tbody,
  Td,
  Tr,
  useDisclosure,
} from '@chakra-ui/react';

import { ChevronRightIcon } from '@chakra-ui/icons';
import { TripPlanStandaloneModal } from '../VerticalTripPlan/TripPlanStandaloneModal';
import formatters from '../../utils/formatters';
import { toJS } from 'mobx';
import { useState } from 'react';
import { useStore } from '../../context/RootStore';

export const DependentsTripsTable = ({
  dependents,
  trips,
  hideTitle,
  limit,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { dependentTracker, resetMap } = useStore().tripMapStore;
  const [selectedTrip, setSelectedTrip] = useState({});

  /*
  10 days of trips
  total duration of trip
  date - time range - name - destination
  */

  const openVerticalTripPlan = trip => {
    dependentTracker.start(trip.dependent);
    setSelectedTrip(trip);
    console.log(toJS(trip));
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
        {!trips.length ? (
          'No upcoming trips.'
        ) : (
          <Box
            border="solid thin lightgray"
            borderColor={limit ? 'lightgray' : 'transparent'}
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
                      <Td>
                        {formatters.datetime
                          .asMD(new Date(trip?.plan?.startTime))
                          .join(' ')}
                      </Td>
                      <Td>{trip?.destination}</Td>
                      <Td>
                        {formatters.datetime.asHHMMA(
                          new Date(trip?.plan?.startTime)
                        )}{' '}
                        -{' '}
                        {formatters.datetime.asHHMMA(
                          new Date(trip?.plan?.endTime)
                        )}
                      </Td>
                      <Td>
                        {!dependents ? (
                          ''
                        ) : (
                          <>
                            {dependents.find(
                              d => d.dependent === trip.dependent
                            )?.firstName +
                              ' ' +
                              dependents.find(
                                d => d.dependent === trip.dependent
                              )?.lastName || ''}
                          </>
                        )}
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
        onClose={onClose}
        backClickHandler={backClickHandler}
      />
    </>
  );
};
