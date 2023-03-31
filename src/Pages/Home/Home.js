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
  Text,
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
  const { updateProperty } = useStore().profile;

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
          <Button
            key={trip.id.toString()}
            p={10}
            _hover={{
              opacity: 0.8,
            }}
            onClick={() => {
              setTripPlan(trip.plan.request);
              openModal();
            }}
            width={'180px'}
            height={'100px'}
          >
            {trip.alias} <Icon as={ChevronRightIcon} ml={2} boxSize={6} />
          </Button>
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
      <ScheduleTripModal
        isOpen={isModalOpen}
        onClose={() => {
          setTripPlan({});
          closeModal();
        }}
      ></ScheduleTripModal>

      <CustomModal isOpen={isVTModalOpen} onClose={closeVTModal}>
        <VerticalTripPlanModal
          title={'Title'}
          descritption={'Description'}
          selectedTrip={selectedTrip}
          removeSavedTrip={() => {}}
          close={closeVTModal}
        />
      </CustomModal>
    </Flex>
  );
});

const VerticalTripPlanModal = observer(
  ({ title, description, selectedTrip, removeSavedTrip, close }) => {
    const { colorMode } = useColorMode();
    return (
      <Card
        size={{ base: 'lg', lg: 'lg' }}
        borderRadius={'md'}
        background={colorMode === 'light' ? 'white' : 'gray.800'}
      >
        <CardHeader pb={2}>
          <Heading size="sm" as="h4" mb={2}>
            Directions
          </Heading>
          <Text>{title}</Text>
          <Text>{description}</Text>
        </CardHeader>
        <CardBody fontWeight={'bold'} py={2}>
          <VerticalTripPlan plan={selectedTrip} />
        </CardBody>
        <CardFooter>
          <Stack display="flex" flexDir={'column'} gap={4} w="100%">
            <Button w="100%" onClick={close} alignSelf="center">
              Close
            </Button>
            <Button
              w="100%"
              onClick={() => removeSavedTrip(selectedTrip.id)}
              colorScheme="red"
              alignSelf={'center'}
            >
              Cancel Scheduled Trip
            </Button>
          </Stack>
        </CardFooter>
      </Card>
    );
  }
);
