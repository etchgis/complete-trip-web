import { useEffect, useRef, useState } from 'react';

import { toJS } from 'mobx';
import useIntervalHook from './useIntervalHook';
import { useStore } from '../context/RootStore';
import { useToast } from '@chakra-ui/react';

const useDependentTripNotifier = () => {
  const { user, loggedIn } = useStore().authentication;
  const { hydrate: hydrateDependents, dependents } = useStore().caregivers;
  const { dependentTrips, hydrateDependentTrips } = useStore().schedule;
  const { dependentTracker } = useStore().notifications;
  const { debug } = useStore().uiStore;
  const toast = useToast();
  const duration = null;
  // const [isActive, setIsActive] = useState(true);
  const [alerts, setAlerts] = useState({
    fiveMinWarning: [],
    oneMinWarning: [],
  });

  const showToast =
    user?.profile?.preferences?.notificationTypes?.includes(
      'dependentTripStart'
    );

  const updateState = (allTrips, tripsWithin5, tripsWithin1) => {
    allTrips.forEach(t => {
      if (
        tripsWithin1.find(trip => trip.id === t.id) &&
        !alerts.oneMinWarning.includes(t.id)
      ) {
        setAlerts(current => ({
          ...current,
          oneMinWarning: [...current.oneMinWarning, t.id],
        }));
      }
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
    // if (tripsWithin5.length === allTrips.length) {
    //   return setIsActive(false);
    // }
  };

  useEffect(() => {
    if (!loggedIn) return;
    if (!dependents.length) {
      console.log('{useDependentNotifier} checking for dependents');
      (async () => {
        await hydrateDependents();
      })();
    }
    //eslint-disable-next-line
  }, [loggedIn]);

  useEffect(() => {
    if (!loggedIn) return;
    if (dependents.length && !dependentTrips.length) {
      console.log('{useDependentNotifier} checking for dependent trips');
      (async () => {
        await hydrateDependentTrips();
      })();
    }
    //eslint-disable-next-line
  }, [loggedIn, dependentTrips, user?.profile?.preferences?.notificationTypes]);

  const checkForDependentTripAlerts = () => {
    if (!dependentTrips.length) return;
    const now = new Date();

    const filterTime = 300000; //5 minutes
    const tripsWithin5 = dependentTrips.filter(trip => {
      const remainingTime = trip.plan.startTime - now.getTime();
      return remainingTime < filterTime && remainingTime > -60000;
    });

    const tripsWithin1 = dependentTrips.filter(trip => {
      const remainingTime = trip.plan.startTime - now.getTime();
      if (trip.plan.startTime > now.getTime() && remainingTime > 59000)
        console.log(
          'dependent trip begins in',
          remainingTime / 1000,
          'seconds'
        );
      return (
        remainingTime > -60000 && trip.plan.startTime - now.getTime() <= 60000
      );
    });

    if (!tripsWithin5.length && !tripsWithin1.length) return;

    // NOTE this is for starting the socket
    if (
      tripsWithin1.length &&
      tripsWithin1.some(t => !alerts.oneMinWarning.includes(t.id))
    ) {
      tripsWithin1.forEach(trip => {
        if (!alerts.oneMinWarning.includes(trip.id)) {
          if (debug) console.log('trips within 1 minute', toJS(trip));

          // if (showToast) {
          //   toast({
          //     title: 'Trip Notification',
          //     description: `${
          //       trip?.dependent?.firstName || 'A dependent'
          //     }'s trip to ${
          //       trip?.destination || trip?.request?.destination?.text
          //     } is starting in 1 minute.`,
          //     status: 'info',
          //     isClosable: true,
          //     duration: duration,
          //     position: 'top-right',
          //     variant: 'left-accent',
          //   });
          // }
          console.log(
            `${now.toLocaleTimeString()} {useDependentNotifier} opening websocket`
          );
          dependentTracker.start(trip?.dependent);
        }
      });
    }

    if (
      tripsWithin5.length &&
      tripsWithin5.some(t => !alerts.fiveMinWarning.includes(t.id)) &&
      showToast
    ) {
      if (debug) console.log('trips within 5 minutes', toJS(tripsWithin5));
      tripsWithin5.forEach(trip => {
        if (!alerts.fiveMinWarning.includes(trip.id)) {
          toast({
            title: 'Trip Notification',
            description: `${
              trip?.dependent?.firstName || 'A dependent'
            }'s trip to ${
              trip?.destination || trip?.request?.destination?.text
            } is starting soon.`,
            status: 'info',
            isClosable: true,
            duration: duration,
            position: 'top-right',
            variant: 'left-accent',
          });
        }
      });
    }

    updateState(dependentTrips, tripsWithin5, tripsWithin1);
  };

  //NOTE showing this right away works but then gets duplicated by the interval
  // useEffect(() => {
  //   if (!dependentTrips.length) return;
  //   checkForDependentTripAlerts();
  // }, [dependentTrips]);

  useIntervalHook(
    () => {
      if (loggedIn && dependentTrips.length && debug) {
        console.log('{useDependentTripNotifier} checking');
      }
      checkForDependentTripAlerts();
    },
    !loggedIn || !dependentTrips.length ? null : 10000
  );
};

export default useDependentTripNotifier;
