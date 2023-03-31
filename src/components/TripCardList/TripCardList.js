import {
  Box,
  Button,
  StatLabel as ChakraStatLabel,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Stack,
  Stat,
  StatGroup,
  StatNumber,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';
import { FaChevronRight, FaRegStar, FaStar } from 'react-icons/fa';
import { useRef, useState } from 'react';

import { ArrowForwardIcon } from '@chakra-ui/icons';
import CustomModal from '../Modal';
import formatters from '../../utils/formatters';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { useStore } from '../../context/RootStore';

export const TripCardList = observer(({ openModal, setSelectedTrip }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();
  const inputRef = useRef();
  const [tripId, setTripId] = useState(null);
  const { trips } = useStore().schedule;
  // const { setInTransaction } = useStore().authentication;
  const {
    trips: favoriteTrips,
    addTrip: addTripFav,
    removeTrip: removeTripFav,
  } = useStore().favorites;

  console.log('favoriteTrips', toJS(favoriteTrips));
  console.log('trips', toJS(trips));

  const updateFavoriteTrips = async (id, isFavorite) => {
    if (isFavorite) {
      console.log('removeTrip', id);
      removeTripFav(id);
    } else {
      onClose();
      const trip = trips.find(t => t.id === id) || null;
      if (!trip) return;
      let favoriteTrip = {
        ...trip.plan.request,
      };
      favoriteTrip.alias = inputRef.current.value;
      console.log('addTrip', tripId, favoriteTrip);
      addTripFav(tripId, favoriteTrip);
      setTripId(null);
    }
  };

  return (
    // TODO make this card be rows on mobile
    <>
      <Stack maxW={{ base: '100%', sm: '540px' }} gap={4}>
        {trips.map(trip => {
          return (
            <StatGroup
              key={trip.id}
              background={colorMode === 'light' ? 'white' : 'gray.800'}
              p={4}
              borderRadius={'md'}
              border="1px"
              borderColor={colorMode === 'light' ? 'gray.300' : 'gray.400'}
              flexDir={{ base: 'column', sm: 'row' }}
            >
              <Stat flex={0} pr={10}>
                <StatLabel>
                  {new Date(trip.datetime)
                    .toLocaleString('en-US', { month: 'short' })
                    .match(/\b\w{3}\b/)[0]
                    .toUpperCase()}
                </StatLabel>
                <StatNumber>{new Date(trip.datetime).getDate()}</StatNumber>
              </Stat>

              <Stat>
                <StatLabel>
                  {formatters.datetime.asHHMMA(new Date(trip.datetime))}{' '}
                  {formatters.datetime.asDuration(trip?.plan?.duration)}{' '}
                </StatLabel>
                <StatNumber fontSize={'lg'}>
                  {favoriteTrips.find(f => f.id === trip.plan.request.id) ? (
                    favoriteTrips.find(f => f.id === trip.plan.request.id).alias
                  ) : (
                    <>
                      {trip.origin.address.split(',')[0]} <ArrowForwardIcon />{' '}
                      {trip.destination.address.split(',')[0]}
                    </>
                  )}
                </StatNumber>
                {/* <StatLabel>{trip.id}</StatLabel> */}
              </Stat>
              <Box alignSelf={'center'}>
                {favoriteTrips.find(f => f.id === trip.plan.request.id) ? (
                  <IconButton
                    icon={<FaStar />}
                    variant="ghost"
                    onClick={() =>
                      updateFavoriteTrips(trip.plan.request.id, true)
                    }
                    colorScheme="red"
                    fontSize={'2xl'}
                  />
                ) : (
                  <IconButton
                    icon={<FaRegStar />}
                    variant="ghost"
                    onClick={() => {
                      setTripId(trip.id);
                      onOpen();
                    }}
                    colorScheme="red"
                    fontSize={'2xl'}
                  />
                )}
                <IconButton
                  icon={<FaChevronRight />}
                  variant="ghost"
                  fontSize={'xl'}
                  onClick={() => {
                    setSelectedTrip(trip);
                    openModal();
                  }}
                />
              </Box>
            </StatGroup>
          );
        })}
      </Stack>
      <CustomModal isOpen={isOpen} onClose={onClose} size="md">
        <Box
          as="form"
          onSubmit={e => {
            e.preventDefault();
            updateFavoriteTrips(tripId, false);
          }}
          p={10}
        >
          <FormControl>
            <FormLabel>Trip Name</FormLabel>
            <Input ref={inputRef} type="text" isRequired />
          </FormControl>
          <Button type="submit" w="100%" mt={4}>
            Save Favorite
          </Button>
        </Box>
      </CustomModal>
    </>
  );
});

const StatLabel = ({ children, ...props }) => (
  <ChakraStatLabel {...props} fontSize="md" fontWeight={'bold'}>
    {children}
  </ChakraStatLabel>
);
