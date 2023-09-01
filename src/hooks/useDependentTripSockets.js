import { toJS } from 'mobx';
import { useEffect } from 'react';
import useIntervalHook from './useIntervalHook';
import { useStore } from '../context/RootStore';

const useDependentTripSockets = () => {
  const { loggedIn } = useStore().authentication;
  const { hydrate: hydrateDependents, dependents } = useStore().caregivers;
  const { dependentTrips, hydrateDependentTrips } = useStore().schedule;
  const { notificationTracker } = useStore().notifications;
  const { sockets, setTodaysTrips } = useStore().notifications;
  const { debug } = useStore().uiStore;

  useEffect(() => {
    if (!loggedIn) return;
    if (!dependents.length) {
      console.log('{useDependentNotifier} checking for dependents');
      (async () => {
        await hydrateDependents();
        await hydrateDependentTrips();
      })();
    }
    //eslint-disable-next-line
  }, [loggedIn]);

  useEffect(() => {
    if (!dependents || !dependentTrips.length) return;
    const todaysTrips = dependentTrips.filter(trip => {
      const tripDate = new Date(trip.plan.startTime);
      const today = new Date();
      return (
        tripDate.getDate() === today.getDate() &&
        tripDate.getMonth() === today.getMonth() &&
        tripDate.getFullYear() === today.getFullYear()
      );
    });
    if (!todaysTrips.length) return;
    setTodaysTrips(todaysTrips);
    if (debug) {
      const _todaysTrips = todaysTrips.map(t => toJS(t));
      console.log({ _todaysTrips });
    }

    //OR
    // const todaysTrips = dependentTrips.filter(trip => {
    //   const tripDate = new Date(trip.plan.startTime);
    //   tripDate.setHours(0, 0, 0, 0); // Set time to midnight
    //   const today = new Date();
    //   today.setHours(0, 0, 0, 0); // Set time to midnight

    //   return tripDate.getTime() === today.getTime();
    // });

    todaysTrips.forEach(trip => {
      //NOTE let the notification store handle the logic of whether or not to add the new socket if one is already added
      notificationTracker.start(trip.dependent);
    });
    //eslint-disable-next-line
  }, [dependents, dependentTrips]);

  //NOTE testing closing sockets
  // useEffect(() => {
  //   if (!loggedIn) return;
  //   setTimeout(() => {
  //     if (!sockets.length) return;
  //     console.log('{useDependentTripSockets} closing socket');
  //     sockets[0].socket.close();
  //   }, 10000);
  //   //eslint-disable-next-line
  // }, [loggedIn, sockets]);

  const checkForClosedSockets = () => {
    if (!sockets.length) return;
    sockets.forEach(socket => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ message: 'ping' }));
      } else if (socket.readyState === WebSocket.CLOSED) {
        console.log('{useDependentTripSockets} socket closed');
        const dependent = socket.url.split('dependent-')[1];
        const name = socket.url.split('name=')[1];
        notificationTracker.stop(dependent);
        notificationTracker.start({ dependent, firstName: name });
      }
    });
  };

  useIntervalHook(
    () => {
      if (loggedIn && sockets.length && debug) {
        console.log('{useDependentTripSockets} polling');
      }
      checkForClosedSockets();
    },
    !loggedIn || !sockets.length ? null : 1000 * 60 * 1
  );
};

export default useDependentTripSockets;
