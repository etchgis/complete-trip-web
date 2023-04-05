//import and create a new table component

import {
  Box,
  Flex,
  Icon,
  IconButton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tr,
} from '@chakra-ui/react';
import {
  FaArrowRight,
  FaChevronRight,
  FaRegStar,
  FaStar,
} from 'react-icons/fa';

import { RxDotFilled } from 'react-icons/rx';
import formatters from '../../utils/formatters';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../context/RootStore';

export const TripTable = observer(({ openModal, setSelectedTrip }) => {
  const { trips: allTrips } = useStore().schedule;
  const { trips: favoriteTrips, locations } = useStore().favorites;
  const trips = allTrips.length
    ? allTrips.slice().sort((a, b) => {
        return new Date(a.plan.startTime) - new Date(b.plan.startTime);
      })
    : [];

  return (
    <Box>
      <Text textTransform={'uppercase'} fontSize={'14px'} mb={4}>
        Upcoming
      </Text>
      <TableContainer borderRadius="md" boxShadow="md" maxW="1000px">
        <Table variant="simple" size="sm">
          <Tbody>
            {trips.map(trip => {
              // const isFavorite = favoriteTrips.some(t => t.id === trip.id);
              const startAlias =
                locations.find(l => l.id === trip.plan.request.origin?.id)
                  ?.alias || null;
              const endAlias =
                locations.find(l => l.id === trip.plan.request.destination?.id)
                  ?.alias || null;
              return (
                <Tr key={trip.id}>
                  <Td fontWeight="bold">
                    {new Date(trip.plan.startTime)
                      .toLocaleString('en-US', { month: 'short' })
                      .match(/\b\w{3}\b/)[0]
                      .toUpperCase()}{' '}
                    {new Date(trip.plan.startTime).getDate()}
                  </Td>
                  <Td>
                    {favoriteTrips.find(f => f.id === trip.plan.request.id)
                      ?.alias || ''}
                  </Td>
                  <Td>
                    <Flex alignItems="center">
                      <Text fontSize={'14px'}>
                        {formatters.datetime.asHHMMA(
                          new Date(trip.plan.startTime)
                        )}
                      </Text>
                      <Icon as={RxDotFilled} fontSize={'md'} opacity={0.7} />
                      <Text>
                        {formatters.datetime.asDuration(trip?.plan?.duration)}
                      </Text>
                    </Flex>
                  </Td>
                  <Td>
                    <Flex alignItems="center">
                      <Text fontSize={'14px'}>
                        {startAlias || trip.plan.request.origin.title}
                      </Text>
                      <Icon as={FaArrowRight} mx={2} opacity={0.7} />
                      <Text>
                        {endAlias || trip.plan.request.destination.title}
                      </Text>
                    </Flex>
                  </Td>
                  <Td>
                    {favoriteTrips.find(f => f.id === trip.plan.request.id) ? (
                      <IconButton
                        icon={<FaStar />}
                        variant="ghost"
                        onClick={() => {}}
                        colorScheme="red"
                        fontSize={'xl'}
                      />
                    ) : (
                      <IconButton
                        icon={<FaRegStar />}
                        variant="ghost"
                        onClick={() => {}}
                        colorScheme="gray"
                        fontSize={'xl'}
                      />
                    )}
                  </Td>
                  <Td>
                    <IconButton
                      icon={<FaChevronRight />}
                      variant="ghost"
                      fontSize={'md'}
                      onClick={() => {
                        setSelectedTrip(trip);
                        openModal();
                      }}
                    />
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
});
