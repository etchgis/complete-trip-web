import { Flex, Grid, useColorMode, useDisclosure } from '@chakra-ui/react';

import Calendar from '../components/TripCalendar';
// import CustomModal from '../components/Modal';
import ScheduleTripHeader from '../components/ScheduleTripHeader';
import TripCardList from '../components/TripCardList';
import { TripPlanStandaloneModal } from '../components/VerticalTripPlan/TripPlanStandaloneModal';
// import VerticalTripPlan from '../components/VerticalTripPlan';
import { observer } from 'mobx-react-lite';
// import overviewMap from '../assets/overview-map.png';
// import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useStore } from '../context/RootStore';

// import { ChevronRightIcon } from '@chakra-ui/icons';

// import ScheduleTripModal from '../../components/ScheduleTripModal';

// import config from '../../config';
const Home = observer(
  ({ isTripWizardOpen, openTripWizard, closeTripWizard }) => {
    // const {
    //   isOpen: isModalOpen,
    //   onOpen: openModal,
    //   onClose: closeModal,
    // } = useDisclosure();
    const {
      isOpen: isVTModalOpen,
      onOpen: openVTModal,
      onClose: closeVTModal,
    } = useDisclosure();
    const { colorMode } = useColorMode();
    const { cancel } = useStore().schedule;
    const [selectedTrip, setSelectedTrip] = useState({});

    const cancelTrip = async id => {
      await cancel(id);
      close();
    };

    return (
      <Flex flexDir={'column'}>
        {/* HEADER */}
        <ScheduleTripHeader
          isTripWizardOpen={isTripWizardOpen}
          closeTripWizard={closeTripWizard}
          openTripWizard={openTripWizard}
        />

        <Grid
          id="home-grid-container"
          p={6}
          gridTemplateColumns={['1fr', '1fr', '1fr', '1fr', '440px 1fr']}
          columnGap={10}
          rowGap={8}
          background={colorMode === 'light' ? 'gray.100' : 'tripDim'}
          flex={1}
          gridTemplateRows={'max-content'}
          // backgroundImage={`https://api.mapbox.com/styles/v1/${config.MAP.BASEMAPS.NIGHT.replace(
          //   'mapbox://styles/',
          //   ''
          // )}/static/${config.MAP.CENTER[1]},${config.MAP.CENTER[0]},12/1280x1280?&access_token=${config.MAP.MAPBOX_TOKEN
          //   }`}
          // backgroundImage={overviewMap}
          // backgroundPosition="center"
          // backgroundRepeat="no-repeat"
          // backgroundSize="cover"
          // onClick={(e) => {
          //   const target = e.target.id;
          //   // console.log(e.target)
          //   if (target === 'home-grid-container' || target === 'trip-card-list') {
          //     // console.log('clicked')
          //     navigate("/map")
          //   }
          // }}
          cursor="pointer"
        >
          <TripCardList
            openModal={openVTModal}
            setSelectedTrip={setSelectedTrip}
          />
          <Calendar />
        </Grid>

        {/* TRIP SCHEDULER
      <ScheduleTripModal
        favoriteTrip={tripPlan}
        isOpen={isModalOpen}
        onClose={() => {
          setTripPlan({});
          closeModal();
        }}
      ></ScheduleTripModal> */}

        {/* VERTICAL TRIP PLAN */}
        <TripPlanStandaloneModal
          request={selectedTrip?.plan?.request}
          plan={selectedTrip?.plan}
          isOpen={isVTModalOpen}
          onClose={closeVTModal}
          backClickHandler={() => {
            closeVTModal();
          }}
          cancelClickHandler={async () => {
            await cancelTrip(selectedTrip?.id);
            closeVTModal();
          }}
        />
        {/* <CustomModal isOpen={isVTModalOpen} onClose={closeVTModal} size="full">
        <VerticalTripPlanModal
          title={selectedTrip?.request?.alias}
          descritption={selectedTrip.description}
          selectedTrip={selectedTrip}
          close={closeVTModal}
        />
      </CustomModal> */}
      </Flex>
    );
  }
);

export default Home;

// export const VerticalTripPlanModal = observer(({ selectedTrip, close }) => {
//   const { cancel } = useStore().schedule;
//   const { colorMode } = useColorMode();
//   // console.log(toJS(selectedTrip));

//   const cancelTrip = async id => {
//     await cancel(id);
//     close();
//   };

//   return (
//     <Card
//       size={{ base: 'lg', lg: 'lg' }}
//       borderRadius={'none'}
//       background={colorMode === 'light' ? 'white' : 'gray.800'}
//       boxShadow={'none'}
//       maxW="800px"
//       margin="20px auto"
//     >
//       <CardHeader pb={2}>{''}</CardHeader>
//       <CardBody fontWeight={'bold'} py={2}>
//         <VerticalTripPlan
//           tripRquest={selectedTrip.plan.request}
//           tripPlan={selectedTrip.plan}
//         />
//       </CardBody>
//       <CardFooter>
//         <Stack
//           display="flex"
//           flexDir={'column'}
//           gap={4}
//           w="100%"
//           maxW={'400px'}
//           margin="0 auto"
//         >
//           <Button w="100%" onClick={close} alignSelf="center">
//             Close
//           </Button>
//           <Button
//             w="100%"
//             onClick={() => {
//               cancelTrip(selectedTrip.id);
//             }}
//             colorScheme="red"
//             alignSelf={'center'}
//           >
//             Cancel Scheduled Trip
//           </Button>
//         </Stack>
//       </CardFooter>
//     </Card>
//   );
// });
