import {
  Box,
  Heading,
  IconButton,
  Table,
  Tbody,
  Td,
  Text,
  Tr,
} from '@chakra-ui/react';

import { ChevronRightIcon } from '@chakra-ui/icons';
import formatters from '../../utils/formatters';

export const DependentsTrips = ({ dependents, trips }) => {
  /*
  10 days of trips
  total duration of trip
  date - time range - name - destination
  */

  const openVerticalTripPlan = plan => {
    console.log(plan);
  };

  //ACCORDION
  return (
    <Box>
      <Heading as="h2" size="md">
        Upcoming Dependent Trips
      </Heading>
      {!trips.length ? (
        'No upcoming trips.'
      ) : (
        <Box border="solid thin lightgray">
          <Table
            size="md"
            className="dependent-trip-list-table"
            fontSize={'md'}
          >
            <Tbody>
              {trips.map((trip, i) => (
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
                    {formatters.datetime.asHHMMA(new Date(trip?.plan?.endTime))}
                  </Td>
                  <Td>
                    {dependents.find(d => d.dependent === trip.dependent)
                      ?.firstName +
                      ' ' +
                      dependents.find(d => d.dependent === trip.dependent)
                        ?.lastName || ''}
                  </Td>
                  <Td>
                    <IconButton
                      icon={<ChevronRightIcon />}
                      variant={'ghost'}
                      onClick={() => openVerticalTripPlan(trip.plan)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
};
