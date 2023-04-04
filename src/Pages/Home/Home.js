import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  Grid,
  Heading,
  Icon,
  Stack,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';

import { Calendar } from '../../components/TripCalendar/Calendar';
import { ChevronRightIcon } from '@chakra-ui/icons';
import CustomModal from '../../components/Modal';
import ScheduleTripModal from '../../components/ScheduleTripModal';
import TripCardList from '../../components/TripCardList';
import VerticalTripPlan from '../../components/ScheduleTripModal/VerticalTripPlan';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useStore } from '../../context/RootStore';

export const Home = observer(() => {
  const {
    isOpen: isModalOpen,
    onOpen: openModal,
    onClose: closeModal,
  } = useDisclosure();
  const {
    isOpen: isVTModalOpen,
    onOpen: openVTModal,
    onClose: closeVTModal,
  } = useDisclosure();
  const { colorMode } = useColorMode();
  const [selectedTrip, setSelectedTrip] = useState({});
  const [tripPlan, setTripPlan] = useState({});
  const { trips: favoriteTrips } = useStore().favorites;

  return (
    <Flex flexDir={'column'}>
      <Heading as="h2" size="md" mb={6} p={6}>
        Schedule a Trip
      </Heading>

      <Stack
        direction={{ base: 'column', md: 'row' }}
        spacing={6}
        mb={10}
        ml={6}
      >
        {favoriteTrips.map(trip => (
          <FavoriteTripButton
            key={trip.id.toString()}
            favorite={trip}
            setTripPlan={setTripPlan}
            openScheduleModal={openModal}
          />
        ))}
        <Button
          p={10}
          backgroundColor={colorMode === 'light' ? 'trip' : 'trip'}
          color="white"
          _hover={{
            opacity: 0.8,
          }}
          onClick={openModal}
          width={'180px'}
          height={'100px'}
        >
          New Trip <Icon as={ChevronRightIcon} ml={2} boxSize={6} />
        </Button>
      </Stack>

      <Grid
        gridTemplateColumns={['1fr', '1fr', '1fr', '1fr', '440px 1fr']}
        columnGap={10}
        rowGap={8}
        background={colorMode === 'light' ? 'gray.100' : 'gray.700'}
        p={6}
        flex={1}
        gridTemplateRows={'max-content'}
      >
        <TripCardList
          openModal={openVTModal}
          setSelectedTrip={setSelectedTrip}
        />
        <Calendar />
      </Grid>
      <Box
        flex={1}
        background={colorMode === 'light' ? 'gray.100' : 'gray.700'}
      ></Box>

      {/* TRIP SCHEDULER */}
      <ScheduleTripModal
        favoriteTrip={tripPlan}
        isOpen={isModalOpen}
        onClose={() => {
          setTripPlan({});
          closeModal();
        }}
      ></ScheduleTripModal>

      {/* VERTICAL TRIP PLAN */}
      <CustomModal isOpen={isVTModalOpen} onClose={closeVTModal} size="full">
        <VerticalTripPlanModal
          title={selectedTrip?.request?.alias}
          descritption={selectedTrip.description}
          selectedTrip={selectedTrip}
          close={closeVTModal}
        />
      </CustomModal>
    </Flex>
  );
});

const FavoriteTripButton = ({ favorite, setTripPlan, openScheduleModal }) => {
  return (
    <Button
      p={10}
      _hover={{
        opacity: 0.8,
      }}
      onClick={() => {
        setTripPlan(favorite);
        openScheduleModal();
      }}
      width={'200px'}
      height={'100px'}
      whiteSpace={'break-spaces'}
    >
      {trimText(favorite.alias)}
      <Icon as={ChevronRightIcon} ml={2} boxSize={6} />
    </Button>
  );
};

function trimText(text) {
  if (!text) return text;
  if (text.length > 30) {
    return text.substring(0, 30) + '...';
  }
  return text;
}

const VerticalTripPlanModal = observer(({ selectedTrip, close }) => {
  const { cancel } = useStore().schedule;
  const { accessToken } = useStore().authentication.user;
  const { setInTransaction } = useStore().authentication;
  const { colorMode } = useColorMode();
  // console.log(toJS(selectedTrip));

  const cancelTrip = async id => {
    setInTransaction(true);
    await cancel(id, accessToken);
    setInTransaction(false);
    close();
  };

  return (
    <Card
      size={{ base: 'lg', lg: 'lg' }}
      borderRadius={'none'}
      background={colorMode === 'light' ? 'white' : 'gray.800'}
      boxShadow={'none'}
      maxW="800px"
      margin="20px auto"
    >
      <CardHeader pb={2}>{''}</CardHeader>
      <CardBody fontWeight={'bold'} py={2}>
        <VerticalTripPlan
          request={selectedTrip.plan.request}
          plan={selectedTrip.plan}
        />
      </CardBody>
      <CardFooter>
        <Stack
          display="flex"
          flexDir={'column'}
          gap={4}
          w="100%"
          maxW={'400px'}
          margin="0 auto"
        >
          <Button w="100%" onClick={close} alignSelf="center">
            Close
          </Button>
          <Button
            w="100%"
            onClick={() => {
              cancelTrip(selectedTrip.id);
            }}
            colorScheme="red"
            alignSelf={'center'}
          >
            Cancel Scheduled Trip
          </Button>
        </Stack>
      </CardFooter>
    </Card>
  );
});
