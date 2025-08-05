import { Flex } from '@chakra-ui/react';
import MapComponent from '../components/Map';
import ScheduleTripHeader from '../components/ScheduleTripHeader';
import TransitRoutes from '../components/TransitRoutes';
import { observer } from 'mobx-react-lite';
import { useStore } from '../context/RootStore';
import { getKioskOrigin } from '../models/kiosk-definitions';

const Map = observer(
  ({ showMap, isTripWizardOpen, openTripWizard, closeTripWizard }) => {
    const { ux } = useStore().uiStore;
    const { trip: shuttleTrip } = useStore();

    const handleShuttlePress = (shuttle) => {
      if (ux === 'kiosk') {
        shuttleTrip.create();
        const origin = getKioskOrigin();
        if (origin) {
          shuttleTrip.updateOrigin(origin);
          shuttleTrip.addMode('hail');
          shuttleTrip.addMode('walk');
          shuttleTrip.updateWhenAction('asap');
          shuttleTrip.updateWhen(new Date());
          shuttleTrip.toggleShuttle(true);
        }
      }
    }

    const kioskTopHeight = 700;
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
