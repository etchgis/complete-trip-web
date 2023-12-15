import {
  Box,
  Button,
  StatLabel as ChakraStatLabel,
  IconButton,
  Stack,
  Stat,
  StatGroup,
  StatNumber,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';
import { FaChevronRight, FaRegStar, FaStar } from 'react-icons/fa';

import { ArrowForwardIcon } from '@chakra-ui/icons';
import TripFavModal from '../TripFavModal';
import formatters from '../../utils/formatters';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useStore } from '../../context/RootStore';

export const TripCardList = observer(({ openModal, setSelectedTrip }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();
  const [tripId, setTripId] = useState(null);
  const { trips: allTrips } = useStore().schedule;
  const navigate = useNavigate();

  const {
    trips: favoriteTrips,
    removeTrip: removeTripFav,
    locations,
  } = useStore().favorites;

  const trips = allTrips
    .slice()
    .sort((a, b) => {
      return new Date(a.plan.startTime) - new Date(b.plan.startTime);
    })
    .slice(0, 3);

  return (
    // TODO make this card be rows on mobile
    <>
      <Stack maxW={{ base: '100%', sm: '540px' }} gap={4} id="trip-card-list">
        {!trips.length ? (
          <Box
            p={2}
            background={colorMode === 'light' ? 'white' : 'gray.800'}
            borderRadius={'md'}
            border="solid 1px gray"
            borderColor={colorMode === 'light' ? 'gray.300' : 'gray.700'}
          >
            No upcoming trips found.
          </Box>
        ) : (
          trips.map(trip => {
            // console.log(trip);
            const startAlias =
              locations.find(l => l.id === trip.plan.request.origin?.id)
                ?.alias || null;
            const endAlias =
              locations.find(l => l.id === trip.plan.request.destination?.id)
                ?.alias || null;
            return (
              <StatGroup
                key={trip.id}
                background={colorMode === 'light' ? 'white' : 'gray.900'}
                p={4}
                borderRadius={'md'}
                border="1px"
                borderColor={colorMode === 'light' ? 'gray.300' : 'gray.700'}
                flexDir={{ base: 'column', sm: 'row' }}
              >
                <Stat flex={0} pr={10}>
                  <StatLabel>
                    {new Date(trip.plan.startTime)
                      .toLocaleString('en-US', { month: 'short' })
                      .match(/\b\w{3}\b/)[0]
                      .toUpperCase()}
                  </StatLabel>
                  <StatNumber>
                    {new Date(trip.plan.startTime).getDate()}
                  </StatNumber>
                </Stat>

                <Stat>
                  <StatLabel>
                    {formatters.datetime.asHHMMA(new Date(trip.plan.startTime))}{' '}
                    {formatters.datetime.asDuration(trip?.plan?.duration)}{' '}
                  </StatLabel>
                  {favoriteTrips.find(f => f.id === trip.plan.request.id) ? (
                    <>
                      <StatNumber fontSize={'lg'}>
                        {
                          favoriteTrips.find(f => f.id === trip.plan.request.id)
                            ?.alias
                        }
                      </StatNumber>
                      <StatLabel style={{ fontWeight: 'normal' }}>
                        {startAlias ||
                          trip.plan?.request?.origin?.title ||
                          trip.origin.address.split(',')[0]}
                        <ArrowForwardIcon />{' '}
                        {endAlias ||
                          trip.plan?.request?.destination?.title ||
                          trip.destination.address.split(',')[0]}
                      </StatLabel>
                    </>
                  ) : (
                    <StatNumber fontSize={'lg'}>
                      {startAlias ||
                        trip.plan?.request?.origin?.title ||
                        trip.origin.address.split(',')[0]}{' '}
                      <ArrowForwardIcon />{' '}
                      {endAlias ||
                        trip.plan?.request?.destination?.title ||
                        trip.destination.address.split(',')[0]}
                    </StatNumber>
                  )}
                </Stat>
                <Box alignSelf={'center'}>
                  {favoriteTrips.find(f => f.id === trip.plan.request.id) ? (
                    <IconButton
                      className="icon-button"
                      icon={<FaStar />}
                      variant="ghost"
                      onClick={() => removeTripFav(trip.plan.request.id)}
                      colorScheme="red"
                      fontSize={'24px'}
                      aria-label="Add to favorites"
                    />
                  ) : (
                    <IconButton
                      className="icon-button"
                      icon={<FaRegStar />}
                      variant="ghost"
                      onClick={() => {
                        setTripId(trip.id);
                        onOpen();
                      }}
                      colorScheme="red"
                      fontSize={'24px'}
                      aria-label="Remove from favorites"
                    />
                  )}
                  <IconButton
                    className="icon-button"
                    icon={<FaChevronRight />}
                    variant="ghost"
                    fontSize={'xl'}
                    aria-label="View trip details"
                    onClick={() => {
                      setSelectedTrip(trip);
                      openModal();
                    }}
                  />
                </Box>
              </StatGroup>
            );
          })
        )}

        {allTrips.length > 3 && (
          <Button
            rightIcon={<FaChevronRight />}
            backgroundColor={colorMode === 'light' ? 'trip' : 'trip'}
            color="white"
            _hover={{
              background: colorMode === 'light' ? 'tripLight' : 'tripDim',
            }}
            borderRadius={'20px'}
            maxW="200px"
            display={'flex'}
            justifyContent={'space-around'}
            onClick={() => navigate('/trips')}
          >
            See All Trips
          </Button>
        )}
      </Stack>
      <TripFavModal
        isOpen={isOpen}
        onClose={onClose}
        tripId={tripId}
        setTripId={setTripId}
      />
    </>
  );
});

const StatLabel = ({ children, ...props }) => (
  <ChakraStatLabel {...props} fontSize="md" fontWeight={'bold'}>
    {children}
  </ChakraStatLabel>
);
