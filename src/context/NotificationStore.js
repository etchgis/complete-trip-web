import { makeAutoObservable, runInAction, toJS } from 'mobx';

import config from '../config';

//test mode change
//test more than one active trip
//test how does this affect the other toast message when trip plan is opened

class NotificationStore {
  messages = [
    {
      type: 'dependentDepart',
      message: (name, dest) =>
        `${name} has begun their trip${dest ? ' to ' + dest : ''}.`,
    },
    {
      type: 'dependentModeChange',
      message: name => `${name} has changed modes.`,
    },
    {
      type: 'dependentArrive',
      message: (name, dest) =>
        `${name} has reached ${dest || 'their destination'}.`,
    },
    // {
    //   type: 'dependentArrive',
    //   message: name => `${name} has ended their trip.`,
    // },
  ];
  sockets = [];
  trips = [];
  todaysTrips = [];

  constructor(rootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  removeTrip = trip => {
    runInAction(() => {
      const updatedTrips = this.trips.filter(t => t.tripId !== trip.tripId);
      this.trips = [...updatedTrips];
    });
  };

  setTodaysTrips = trips => {
    runInAction(() => {
      this.todaysTrips = trips;
    });
  };

  resetTrip = trip => {
    runInAction(() => {
      const updatedTrip = this.trips.find(t => t.tripId === trip.tripId);
      if (!updatedTrip) return;
      updatedTrip.active = false;
      this.trips = this.trips.map(t =>
        t.tripId === trip.tripId ? updatedTrip : t
      ); //this will not trigger a re-render since it is the same object
    });
  };

  reset = () => {
    runInAction(() => {
      this.trips = [];
    });
  };

  notificationTracker = {
    start: dependent => {
      let tripId = null;
      // console.log(toJS(this.sockets));
      if (this.sockets.find(s => s.url.includes(dependent?.dependent))) return;
      const socket = new WebSocket(
        `${config.SERVICES.websocket}?groups=dependent-${dependent?.dependent}&name=${dependent?.firstName}`
      );
      console.log('{notifications-store} socket', socket);
      runInAction(() => {
        this.sockets = [...this.sockets, socket];
      });

      socket.onopen = e => {
        '{notifications-store} socket established', e;
      };

      socket.onmessage = event => {
        const data = JSON.parse(JSON.parse(JSON.parse(event.data)));
        if (this?.rootStore?.uiStore?.debug) {
          console.log(data);
        }
        tripId = data?.tripId;

        runInAction(() => {
          if (data?.navigating === false) {
            console.log('removing trip');
            this.removeTrip(data);
            return;
          }
          if (!data.legIndex && data?.legIndex !== 0) return;
          if (!this.trips.find(t => t.tripId === tripId)) {
            const thisTrip = this.todaysTrips.find(t => t?.id === tripId);
            const destination = thisTrip?.destination;
            const newTrip = {
              ...data,
              message: this.messages[0].message(
                dependent?.firstName,
                destination
              ),
              type: this.messages[0].type,
              active: true,
              status: null,
              legIndex: 0,
              destination,
            };
            this.trips = [...this.trips, newTrip];
            // this.trips.push(newTrip[0]); //this does not work as it references the same object
          } else if (this.trips.find(t => t.tripId === data.tripId)) {
            const activeTrip = this.trips.find(t => t.tripId === data.tripId);
            if (activeTrip?.status === 'ended') return;
            if (
              activeTrip.legIndex !== data.legIndex &&
              data?.status !== 'ended'
            ) {
              activeTrip.legIndex = data.legIndex;
              activeTrip.active = true;
              activeTrip.message = this.messages[1].message(
                dependent?.firstName
              );
              activeTrip.type = this.messages[1].type;
              activeTrip.status = data?.status;
              const newTrips = this.trips.filter(t => t.tripId !== data.tripId);
              this.trips = [...newTrips, activeTrip];
            } else if (data?.status === 'ended') {
              activeTrip.legIndex = data.legIndex;
              activeTrip.active = true;
              activeTrip.message = this.messages[2].message(
                dependent?.firstName,
                activeTrip?.destination
              );
              activeTrip.type = this.messages[2].type;
              activeTrip.status = 'ended';
              const newTrips = this.trips.filter(t => t.tripId !== data.tripId);
              this.trips = [...newTrips, activeTrip];
            }
          }
        });
      };

      socket.onclose = event => {
        if (event.wasClean) {
          console.log(
            `{notifications-store} socket closed cleanly, code=${event.code} reason=${event.reason}`
          );
        } else {
          console.log('{notifications-store} socket died');
        }
        this.notificationTracker.stop(dependent?.dependent);
        this.removeTrip(tripId);
      };

      socket.onerror = function (error) {
        console.log(`{notifications-store}`, error);
      };
    },

    stop: dependent => {
      runInAction(() => {
        if (!this.sockets.length) return;
        //find the socket with the dependent id in the string
        const socket = this.sockets.find(s => s.url.includes(dependent));
        if (!socket) return;
        socket.close();
        const newSockets = this.sockets.filter(s => s.url !== socket.url);
        this.sockets = [...newSockets];
      });
    },
  };
}

export default NotificationStore;
