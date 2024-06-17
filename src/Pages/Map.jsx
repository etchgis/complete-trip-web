import { Flex } from '@chakra-ui/react';
import MapComponent from '../components/Map';
import ScheduleTripHeader from '../components/ScheduleTripHeader';
import TransitRoutes from '../components/TransitRoutes';
import { observer } from 'mobx-react-lite';
import { useStore } from '../context/RootStore';
import { useEffect, useState } from 'react';

const Map = observer(
  ({ showMap, isTripWizardOpen, openTripWizard, closeTripWizard }) => {
    const { ux } = useStore().uiStore;
    const { trip: shuttleTrip } = useStore();

    const handleShuttlePress = (shuttle) => {
      // console.log('handleShuttlePress', shuttle);
      if (ux === 'kiosk') {
        shuttleTrip.create();
        const queryParams = new URLSearchParams(window.location.search),
          location = queryParams.get('location'),
          coordinates = location.split(',');
        let origin = {
          description: "",
          distance: 0,
          point: {
            lat: +coordinates[1],
            lng: +coordinates[0]
          },
          text: "Kiosk",
          title: "Kiosk"
        }
        shuttleTrip.updateOrigin(origin);
        shuttleTrip.addMode('hail');
        shuttleTrip.addMode('walk');
        shuttleTrip.updateWhenAction('asap');
        shuttleTrip.updateWhen(new Date());
        console.log('shuttleTrip', shuttleTrip);
        shuttleTrip.toggleShuttle(true);
      }
    }

    // useEffect(() => {
    //   console.log('useEffect', shuttleTrip);
    // }), [shuttleTrip]

    const kioskTopHeight = 500;
    const kioskBottomHeight = 255;
    // const kioskMiddleHeight = 1920 - kioskTopHeight - kioskBottomHeight;
    const headerHeight = 60;
    // const mapHeight = kioskMiddleHeight - headerHeight;

    return (
      <Flex
        flex={1}
        flexDir={'row'}
        id="map-view"
        height={(ux === 'webapp' || ux === 'callcenter') ? 'calc(100vh - 60px)' : `calc(100vh - ${(kioskTopHeight + kioskBottomHeight + headerHeight)}px)`}
        overflow={'hidden'}
        display={showMap ? 'flex' : 'none'}
      >
        {/* SIDEBAR */}
        <TransitRoutes
          onShuttlePress={handleShuttlePress}
        />
        {/* MAIN */}
        <Flex
          flex="1"
          flexDir={'column'}
          data-name="map-and-schedule-button"
          width={(ux === 'webapp' || ux === 'callcenter') ? 'calc(100vw - 420px)' : 'calc(100vw - 420px)'}
        >
          {/* HEADER */}
          <ScheduleTripHeader
            isTripWizardOpen={isTripWizardOpen}
            closeTripWizard={closeTripWizard}
            openTripWizard={openTripWizard}
          />
          {/* MAP */}
          <MapComponent showMap={showMap} />
        </Flex>
      </Flex>
    );
  }
);

export default Map;
