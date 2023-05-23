import { Box, Button, FormControl, FormLabel, Input } from '@chakra-ui/react';

import CustomModal from '../Modal';
import { useRef } from 'react';
import { useStore } from '../../context/RootStore';

export const TripFavModal = ({ isOpen, onClose, tripId, setTripId }) => {
  const inputRef = useRef();
  const { trips } = useStore().schedule;
  const { addTrip: addTripFav } = useStore().favorites;

  const addFavoriteTrip = async id => {
    //TODO add error handler here or check favorites store and see what the error handler is
    onClose();
    const trip = trips.find(t => t.id === id) || null;
    if (!trip) return;
    let favoriteTrip = {
      ...trip.plan.request,
    };
    favoriteTrip.alias = inputRef.current.value;
    addTripFav(tripId, favoriteTrip);
    setTripId(null);
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} size="md">
      <Box
        as="form"
        onSubmit={e => {
          e.preventDefault();
          addFavoriteTrip(tripId);
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
  );
};
