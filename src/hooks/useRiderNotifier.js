import { useEffect, useRef, useState } from 'react';

import { toJS } from 'mobx';
import useIntervalHook from './useIntervalHook';
import { useStore } from '../context/RootStore';
import { useToast } from '@chakra-ui/react';

const useRiderNotifier = () => {
  const { user, loggedIn } = useStore().authentication;
  const { trips: riderTrips, hydrate: hydrateRiderTrips } = useStore().schedule;
  const { debug } = useStore().uiStore;
  const toast = useToast();
  const duration = null;
  const [alerts, setAlerts] = useState({
    fiveMinWarning: [],
  });

  const showToast =
    user?.profile?.preferences?.notificationTypes?.includes('tripStart');

  const updateState = (allTrips, tripsWithin5) => {
    allTrips.forEach(t => {
      if (
        tripsWithin5.find(trip => trip.id === t.id) &&
        !alerts.fiveMinWarning.includes(t.id)
      ) {
        setAlerts(current => ({
          ...current,
          fiveMinWarning: [...current.fiveMinWarning, t.id],
        }));
      }
    });
  };

  useEffect(() => {
    if (!loggedIn) return;
    if (!riderTrips.length) {
      console.log('{useRiderNotifier} checking for rider trips');
      (async () => {
        await hydrateRiderTrips();
      })();
    }
    //eslint-disable-next-line
  }, [loggedIn, user?.profile?.preferences?.notificationTypes]);

  const checkForTripAlerts = () => {
    if (!riderTrips.length) return;
    if (debug) console.log(riderTrips.length, 'upcoming rider trips');
    const now = new Date();

    const filterTime = 300000; //5 minutes
    const tripsWithin5 = riderTrips.filter(trip => {
      const remainingTime = trip.plan.startTime - now.getTime();
      return remainingTime < filterTime && remainingTime > -60000;
    });

    if (!tripsWithin5.length) return;

    if (!showToast) {
      if (debug) console.log('hiding trip notification per user preferences');
    }

    if (
      tripsWithin5.length &&
      tripsWithin5.some(t => !alerts.fiveMinWarning.includes(t.id)) &&
      showToast
    ) {
      if (debug) console.log('trips within 5 minutes', toJS(tripsWithin5));
      tripsWithin5.forEach(trip => {
        if (!alerts.fiveMinWarning.includes(trip.id)) {
          console.log(toJS(trip));
          toast({
            title: 'Trip Notification',
            description: `Your trip to ${trip?.plan?.request?.destination?.text} is starting soon.`,
            status: 'info',
            isClosable: true,
            duration: duration,
            position: 'top-right',
            variant: 'left-accent',
          });
        }
      });
    }

    if (showToast) updateState(riderTrips, tripsWithin5);
  };

  //NOTE showing this right away works but then gets duplicated by the interval
  // useEffect(() => {
  //   if (!dependentTrips.length) return;
  //   checkForTripAlerts();
  // }, [dependentTrips]);

  useIntervalHook(
    () => {
      if (loggedIn && riderTrips.length && debug) {
        console.log('{useRiderNotifier} checking');
      }
      checkForTripAlerts();
    },
    !loggedIn || !riderTrips.length ? null : 10000
  );
};

export default useRiderNotifier;
