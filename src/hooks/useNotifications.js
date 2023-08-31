import { useEffect } from 'react';
import { useStore } from '../context/RootStore';
import { useToast } from '@chakra-ui/react';

const useNotifications = () => {
  const { trips, resetTrip } = useStore().notifications;
  const { user } = useStore().authentication;
  const { debug } = useStore().uiStore;
  const { preferences } = user?.profile || {};
  const toast = useToast();

  const showToast = trip => {
    if (!trip.active) return;
    console.log(preferences?.notificationTypes, trip.type);
    if (preferences?.notificationTypes.includes(trip.type)) {
      toast({
        title: 'Trip Notificaiton',
        description: trip.message,
        status: 'info',
        duration: null,
        isClosable: true,
        position: 'top-right',
        variant: 'left-accent',
      });
    }
    resetTrip(trip);
  };

  useEffect(() => {
    if (debug) console.log('{useNotifications} checking messages');
    trips.forEach(trip => showToast(trip));
  }, [trips, user, user?.profile?.preferences?.notificationTypes]);
};

export default useNotifications;
