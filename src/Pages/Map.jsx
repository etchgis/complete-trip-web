import { Flex } from "@chakra-ui/react";
import MapComponent from "../components/Map";
import ScheduleTripHeader from "../components/ScheduleTripHeader";
import TransitRoutes from "../components/TransitRoutes";

const Map = ({ showMap }) => {
  console.log('[map-view] rendering');
  return (
    <Flex
      flex={1}
      flexDir={'row'}
      id="map-view"
      height={'calc(100vh - 60px)'}
      overflow={'hidden'}
      display={showMap ? 'flex' : 'none'}
    >
      {/* SIDEBAR */}
      <TransitRoutes />
      {/* MAIN */}
      <Flex flex="1" flexDir={'column'} id="map-and-schedule-button">
        {/* HEADER */}
        <ScheduleTripHeader />
        {/* MAP */}
        <MapComponent showMap={showMap} />
      </Flex>
    </Flex>
  )
};

export default Map;