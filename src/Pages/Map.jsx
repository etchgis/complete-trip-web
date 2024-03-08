import { Flex } from '@chakra-ui/react';
import MapComponent from '../components/Map';
import ScheduleTripHeader from '../components/ScheduleTripHeader';
import TransitRoutes from '../components/TransitRoutes';
import { observer } from 'mobx-react-lite';
import { useStore } from '../context/RootStore';

const Map = observer(({ showMap }) => {
  const { ux } = useStore().uiStore;

  return (
    <Flex
      flex={1}
      flexDir={'row'}
      id="map-view"
      height={ux === 'webapp' ? 'calc(100vh - 60px)' : 'calc(100vh - 315px)'}
      overflow={'hidden'}
      display={showMap ? 'flex' : 'none'}
    >
      {/* SIDEBAR */}
      <TransitRoutes />
      {/* MAIN */}
      <Flex flex="1" flexDir={'column'} data-name="map-and-schedule-button">
        {/* HEADER */}
        <ScheduleTripHeader />
        {/* MAP */}
        <MapComponent showMap={showMap} />
      </Flex>
    </Flex>
  );
});

export default Map;
