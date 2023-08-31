import { makeAutoObservable, runInAction } from 'mobx';

import config from '../config';

//test mode change
//test more than one active trip
//test how does this affect the other toast message when trip plan is opened

class NotificationStore {
  messages = [
    {
      type: 'dependentDepart',
      message: name => `${name} has begun their trip.`,
    },
    {
      type: 'dependentModeChange',
      message: name => `${name} has changed modes.`,
    },
    {
      type: 'dependentArrive',
      message: name => `${name} has reached their destination.`,
    },
    // {
    //   type: 'dependentArrive',
    //   message: name => `${name} has ended their trip.`,
    // },
  ];
  sockets = [];
  trips = [];

  constructor(rootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  removeTrip = trip => {
    runInAction(() => {
      this.trips = this.trips.filter(t => t.tripId !== trip.tripId);
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

  dependentTracker = {
    // spawn: dependent => {
    //   const notifier = new Notifier();
    //   notifier.start(dependent);
    // },

    start: dependent => {
      let tripId = null;
      const socket = new WebSocket(
        `${config.SERVICES.websocket}?groups=dependent-${dependent?.dependent}`
      );
      console.log('{notifications-store} socket', socket);
      runInAction(() => {
        this.sockets.push(socket);
      });

      socket.onopen = e => {
        '{notifications-store} socket established', e;
      };

      socket.onmessage = event => {
        const data = JSON.parse(JSON.parse(JSON.parse(event.data)));
        if (this?.rootStore?.uiStore?.debug) {
          console.log(data);
        }
        tripId = data.tripId;

        runInAction(() => {
          if (!data.legIndex && data.legIndex !== 0) return;
          if (!this.trips.find(t => t.tripId === data.tripId)) {
            // console.log(dependent?.firstName, data.tripId);
            const newTrip = {
              ...data,
              message: this.messages[0].message(dependent?.firstName),
              type: this.messages[0].type,
              active: true,
              legIndex: data?.legIndex || 0,
            };
            this.trips = [...this.trips, newTrip];
            // this.trips.push(newTrip[0]); //this does not work as it references the same object
          } else if (this.trips.find(t => t.tripId === data.tripId)) {
            const activeTrip = this.trips.find(t => t.tripId === data.tripId);

            if (activeTrip.legIndex !== data.legIndex) {
              activeTrip.legIndex = data.legIndex;
              activeTrip.active = true;
              activeTrip.message = this.messages[1].message(
                dependent?.firstName
              );
              activeTrip.type = this.messages[1].type;
              const newTrips = this.trips.filter(t => t.tripId !== data.tripId);
              this.trips = [...newTrips, activeTrip];
            }
          } else if (data?.status === 'arrived') {
            //need the message where the trip has ended
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
        this.stop(dependent?.dependent);
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
        const socket = this.sockets.find(s => s.includes(dependent?.dependent));
        if (!socket) return;
        socket.close();
        this.sockets = this.sockets.filter(s => s !== socket);
      });
    },
  };
}

export default NotificationStore;
