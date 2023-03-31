import * as polyline from '@mapbox/polyline';
import * as simplify from 'simplify-geojson';

import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Center,
  Checkbox,
  CheckboxGroup,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  Heading,
  Icon,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Spinner,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  VStack,
  useColorMode,
  useToast,
} from '@chakra-ui/react';
import { FaArrowRight, FaCaretRight, FaCircle } from 'react-icons/fa';

import AddressSearchForm from '../AddressSearchForm';
import CreateIcon from '../CreateIcon';
import { SavedTrips } from '../../Pages/Home/savedTrips';
import VerticalTripPlan from './VerticalTripPlan';
import config from '../../config';
import { fillGaps } from '../../utils/tripplan';
import formatters from '../../utils/formatters';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { useEffect } from 'react';
import { useState } from 'react';
import { useStore } from '../../context/RootStore';

export const ScheduleTripModal = observer(({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);
  const { trip: stagedTrip } = useStore();
  const [selectedTrip, setSelectedTrip] = useState({});

  const Wizard = [
    {
      name: 'First',
      component: <First setStep={setStep} trip={stagedTrip} />,
    },
    {
      name: 'Second',
      component: (
        <Second
          setStep={setStep}
          trip={stagedTrip}
          setSelectedTrip={setSelectedTrip}
        />
      ),
    },
    // {
    //   name: 'Test',
    //   component: <Test setStep={setStep} trip={stagedTrip} />,
    // },
    {
      name: 'Third',
      component: (
        <Third
          setStep={setStep}
          trip={stagedTrip}
          setSelectedTrip={setSelectedTrip}
          selectedTrip={selectedTrip}
        />
      ),
    },
    {
      name: 'Fourth',
      component: (
        <Fourth
          setStep={setStep}
          trip={stagedTrip}
          selectedTrip={selectedTrip}
          closeModal={onClose}
          setSelectedTrip={setSelectedTrip}
        />
      ),
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setStep(0);
        onClose();
        stagedTrip.create();
      }}
      size="full"
    >
      <ModalOverlay />
      <ModalContent textAlign={'center'} pt={10}>
        <ModalHeader>
          {step === 0
            ? 'Schedule a Trip'
            : step === 1
            ? 'Select your Transportation'
            : step === 2
            ? 'Select a Trip'
            : 'Trip Details'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody
          width="auto"
          minW={{ base: '100%', md: 'lg' }}
          maxW="100%"
          margin="0 auto"
        >
          {Wizard.find((w, i) => i === step).component}
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            variant={'ghost'}
            onClick={() => {
              setStep(0);
              stagedTrip.create();
              onClose();
            }}
          >
            Cancel Trip
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});

const First = observer(({ setStep, trip }) => {
  const [startError, setStartError] = useState(false);
  const [endError, setEndError] = useState(false);

  const [locations, setLocations] = useState({
    start: trip?.request?.origin || {},
    end: trip?.request?.destination || {},
  });

  useEffect(() => {
    setStartError(false);
  }, [locations?.start?.name, setStartError]);

  useEffect(() => {
    setEndError(false);
  }, [locations?.end?.name, setEndError]);

  const setStart = result => {
    setLocations(current => {
      return {
        ...current,
        start: result,
      };
    });
  };

  const setEnd = result => {
    setLocations(current => {
      return {
        ...current,
        end: result,
      };
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const data = new FormData(e.target);
    console.log(locations);
    //TODO set an error here
    if (!locations?.start?.name) {
      setStartError(true);
      return;
    }
    if (!locations?.end?.name) {
      setEndError(true);
      return;
    }

    trip.updateOrigin(locations.start);
    trip.updateDestination(locations.end);
    trip.updateWhenAction('asap'); //TODO add leave, arrive
    trip.updateWhen(new Date(data.get('date') + ' ' + data.get('time')));
    trip.updateWhenAction(data.get('when'));
    setStep(current => current + 1);
  };

  return (
    <Stack
      as="form"
      spacing={6}
      onSubmit={handleSubmit}
      maxWidth="lg"
      margin={'0 auto'}
      textAlign={'left'}
    >
      <FormControl isInvalid={startError}>
        <AddressSearchForm
          saveAddress={() => {}}
          center={{ lng: -78.878738, lat: 42.88023 }}
          defaultAddress={locations?.start?.name || ''}
          setGeocoderResult={setStart}
          name="startAddress"
          label="From"
          required={true}
          clearResult={true}
        />

        <FormErrorMessage>
          Please select a location from the result list.
        </FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={endError}>
        <AddressSearchForm
          saveAddress={() => {}}
          center={{ lng: -78.878738, lat: 42.88023 }}
          defaultAddress={locations?.end?.name || ''}
          setGeocoderResult={setEnd}
          name="endAddress"
          label="To"
          required={true}
          clearResult={true}
        />
        <FormErrorMessage>
          Please select a location from the result list.
        </FormErrorMessage>
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Select a Date</FormLabel>
        <Input
          type="date"
          defaultValue={parseDate(trip?.request?.whenTime)}
          name="date"
        ></Input>
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Time</FormLabel>
        <Select
          name="when"
          mb={6}
          defaultValue={trip?.request?.whenAction || 'asap'}
        >
          <option value="asap">Leave Now (ASAP)</option>
          <option value="leave">Leave By</option>
          <option value="arrive">Arrive By</option>
        </Select>
        <Input
          type="time"
          defaultValue={parseTime(trip?.request?.whenTime)}
          name="time"
        ></Input>
      </FormControl>

      <Button width="100%" colorScheme={'blue'} type="submit">
        Next
      </Button>
    </Stack>
  );
});

const Second = observer(({ setStep, trip, setSelectedTrip }) => {
  const { user } = useStore().authentication;
  console.log(toJS(trip));
  const allowedModes = config.MODES.reduce(
    (acc, mode) => [...acc, mode.mode],
    []
  );
  const [modes, setModes] = useState(
    trip?.request?.modes.length
      ? trip.request.modes
      : user?.profile?.preferences?.modes || []
  );

  console.log(toJS(user.profile));

  const handleSubmit = e => {
    e.preventDefault();
    setSelectedTrip({});
    const data = new FormData(e.target);
    console.log([...data]);

    trip.updateProperty('riders', +data.get('riders'));
    trip.updateProperty('caretaker', data.get('caretaker'));

    setStep(current => current + 1);
  };

  useEffect(() => {
    modes.forEach(mode => {
      if (!trip.request.modes.includes(mode) && allowedModes.includes(mode)) {
        trip.addMode(mode);
      }
      trip.request.modes.forEach(m =>
        !modes.includes(m) ? trip.removeMode(m) : null
      );
    });
    //eslint-disable-next-line
  }, [modes]);

  const setCaretaker = e => {
    trip.updateProperty('caretaker', e.target.value);
  };

  return (
    <Stack
      as="form"
      spacing={6}
      maxWidth="lg"
      margin={'0 auto'}
      textAlign={'left'}
      onSubmit={handleSubmit}
    >
      <FormControl isRequired={!modes.length}>
        <FormLabel>Mode(s) of Transportation</FormLabel>
        <VStack alignItems={'flex-start'}>
          <CheckboxGroup onChange={e => setModes(e)} defaultValue={modes}>
            {config.MODES.map(mode => {
              if (mode.id === 'walk') return '';
              return (
                <Checkbox key={mode.id} value={mode.mode}>
                  {mode.label}
                </Checkbox>
              );
            })}
          </CheckboxGroup>
        </VStack>
      </FormControl>

      <FormControl>
        <FormLabel>How Many People are Riding?</FormLabel>
        <Select name="riders" defaultValue={trip?.request?.riders}>
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4</option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>Select a Caretaker</FormLabel>
        <Select
          name="caretaker"
          defaultValue={trip?.request?.caretaker}
          onChange={e => setCaretaker(e)}
        >
          <option value="">Select a Caretaker</option>
          {user?.profile?.caretakers?.map((caretaker, i) => (
            <option
              key={i.toString()}
              value={caretaker?.firstName + ' ' + caretaker?.lastName}
            >
              {caretaker?.firstName + ' ' + caretaker?.lastName}
            </option>
          ))}
        </Select>
      </FormControl>

      <Button type="submit" colorScheme="blue">
        Next
      </Button>
      <Button onClick={() => setStep(current => current - 1)}>Back</Button>
    </Stack>
  );
});

const Third = observer(({ setStep, setSelectedTrip, selectedTrip }) => {
  const { trip } = useStore();
  useEffect(() => {
    if (!Object.keys(selectedTrip).length) {
      trip.generatePlans();
    }
    //eslint-disable-next-line
  }, []);

  return (
    <Stack spacing={6} maxWidth="lg" margin={'0 auto'} textAlign={'left'}>
      <VStack spacing={6}>
        {trip.generatingPlans ? (
          <>
            <Heading as="p" size="sm">
              Generating Plans...
            </Heading>
            <Spinner
              thickness="4px"
              speed="0.65s"
              emptyColor="gray.200"
              color="blue.500"
              size="xl"
            />
          </>
        ) : (
          <TripResults
            setStep={setStep}
            trips={trip?.plans || []}
            setSelectedTrip={setSelectedTrip}
          ></TripResults>
        )}
      </VStack>
      {/* <Button
        onClick={() => setStep(current => current + 1)}
        colorScheme="blue"
      >
        Next
      </Button> */}
      <Button onClick={() => setStep(current => current - 1)}>Back</Button>
    </Stack>
  );
});

const Fourth = observer(
  ({ setStep, selectedTrip, trip, closeModal, setSelectedTrip }) => {
    const { loggedIn } = useStore().authentication;
    const { updateProperty } = useStore().profile;
    const { add: saveTrip } = useStore().schedule;
    const savedTrips = SavedTrips();
    const toast = useToast();

    const planLegs = fillGaps(selectedTrip.legs);
    const features = [];
    planLegs.forEach(v =>
      v?.legGeometry?.points
        ? features.push(polyline.toGeoJSON(v?.legGeometry?.points))
        : null
    );
    const geojson = simplify(
      {
        type: 'Feature',
        properties: {
          'stroke-width': 4,
          stroke: '#02597E',
        },
        geometry: {
          type: 'LineString',
          coordinates: features.reduce((a, f) => [...a, ...f.coordinates], []),
        },
      },
      0.001
    );
    // console.log(geojson);
    console.log(trip.request);

    async function scheduleTrip() {
      const updated = await saveTrip(selectedTrip, trip.request);
      console.log({ updated });
      // const savedTrip = Object.assign({}, toJS(selectedTrip), {
      //   whenTime: trip.request.whenTime,
      //   id: nanoid(12),
      //   start: trip.request.origin,
      //   end: trip.request.destination,
      // });
      // console.log({ savedTrip });
      // const updated = await updateProperty('savedTrips', [
      //   ...savedTrips,
      //   savedTrip,
      // ]);
      // console.log({ updated });
      if (updated) {
        toast({
          title: 'Success',
          description: 'Trip Saved',
          status: 'success',
          duration: 1500,
          isClosable: true,
          position: 'top-right',
          variant: 'top-accent',
        });
        closeModal();
        setSelectedTrip({});
        setStep(0);
        trip.create();
      }
    }

    // console.log(toJS(trip));
    return (
      <Stack
        as="form"
        spacing={6}
        width={{ base: '100%', lg: '800px' }}
        maxW={{ base: '100%', lg: '800px' }}
        maxWidth="2xl"
        margin={'0 auto'}
        textAlign={'left'}
      >
        <Grid
          gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }}
          gap={4}
          position="relative"
        >
          <Box
            position={'relative'}
            width={{ base: '100%', md: '324px' }}
            maxW="100%"
          >
            <Center>
              <Heading as="h3" size="md" mb={2}>
                {(trip?.request?.whenTime).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Heading>
            </Center>
            <Flex
              position="absolute"
              zIndex={2}
              w={{ base: '100%', md: '100%' }}
              maxW="540px"
            >
              <Grid
                borderRadius={'2xl'}
                h="80px"
                w="80%"
                // background={
                //   'linear-gradient(90deg, hsl(202deg 100% 60%), hsl(240deg 46% 61%) 100%)'
                // }
                backgroundColor={'trip'}
                mt={'40px'}
                mx="auto"
                px={2}
                py={4}
                color={'white'}
                gridTemplateColumns={'1fr 1fr 1fr'}
                gap={0}
              >
                <Box textAlign="center">
                  <Text fontSize={'sm'}>Leave</Text>
                  <Box>
                    {formatters.datetime
                      .asHMA(new Date(selectedTrip?.startTime))
                      .replace('am', '')
                      .replace('pm', '')}
                    <sub style={{ textTransform: 'uppercase' }}>
                      {' '}
                      {formatters.datetime
                        .asHMA(new Date(selectedTrip?.startTime))
                        .slice(-2)}
                    </sub>
                  </Box>
                </Box>
                <Flex alignItems={'center'} justifyContent={'center'}>
                  <Center
                    background={'rgba(255,255,255,0.5)'}
                    h={10}
                    w={10}
                    borderRadius="lg"
                  >
                    <Icon as={FaArrowRight} color={'white'} />
                  </Center>
                </Flex>

                <Box textAlign="center" mx={2}>
                  <Text fontSize={'sm'}>Arrive</Text>
                  <Box>
                    {formatters.datetime
                      .asHMA(new Date(selectedTrip?.endTime))
                      .replace('am', '')
                      .replace('pm', '')}
                    <sub style={{ textTransform: 'uppercase' }}>
                      {' '}
                      {formatters.datetime
                        .asHMA(new Date(selectedTrip?.endTime))
                        .slice(-2)}
                    </sub>
                  </Box>
                </Box>
              </Grid>
            </Flex>

            <Image
              src={`https://api.mapbox.com/styles/v1/${config.MAP.BASEMAPS.DAY.replace(
                'mapbox://styles/',
                ''
              )}/static/geojson(${encodeURIComponent(
                JSON.stringify(geojson)
              )})/auto/540x960?padding=120,20,20,20&before_layer=waterway-label&access_token=${
                config.MAP.MAPBOX_TOKEN
              }`}
              alt="map"
              borderRadius={'md'}
              margin={{ base: '60px 0', md: 'calc(calc(100% - 200px) / 2) 0' }}
            />
          </Box>
          <TripCardDetail
            trip={trip}
            selectedTrip={selectedTrip}
          ></TripCardDetail>
        </Grid>
        <Stack spacing={6} alignItems="center">
          <Button
            onClick={scheduleTrip}
            colorScheme="blue"
            isDisabled={!loggedIn}
            width={{ base: '100%', md: '65%' }}
          >
            Schedule Trip
          </Button>
          <Button
            width={{ base: '100%', md: '65%' }}
            onClick={() => setStep(current => current - 1)}
          >
            Back
          </Button>
        </Stack>
      </Stack>
    );
  }
);

const TripResults = observer(({ setStep, trips, setSelectedTrip }) => {
  // console.log(toJS(trips));
  return (
    <>
      {trips.length
        ? trips.map((t, i) => (
            <TripCard
              setStep={setStep}
              tripPlan={t}
              index={i}
              key={i.toString()}
              setSelectedTrip={setSelectedTrip}
            />
          ))
        : 'No trips found'}
    </>
  );
});

const TripCard = ({ setStep, tripPlan, index, setSelectedTrip }) => {
  const { user } = useStore().authentication;
  const tripModes = tripPlan.legs.reduce((acc, leg) => [...acc, leg.mode], []);
  const tripModesSet = Array.from(new Set(tripModes));
  const wheelchair = user?.profile?.preferences?.wheelchair;

  return (
    <Box key={index.toString() + tripPlan?.id} width="100%">
      <Card
        size={'sm'}
        width="100%"
        _hover={{
          cursor: 'pointer',
          boxShadow: 'lg',
        }}
        as="button"
        onClick={() => {
          setSelectedTrip(tripPlan);
          setStep(current => current + 1);
        }}
      >
        <CardBody width="100%">
          <Grid gridTemplateColumns={'25% 30px 25% calc(50% - 30px)'}>
            <Stat>
              <StatLabel>Leave</StatLabel>
              <StatNumber>
                {formatters.datetime
                  .asHMA(new Date(tripPlan.startTime))
                  .replace('am', '')
                  .replace('pm', '')}
                <sub style={{ textTransform: 'uppercase' }}>
                  {' '}
                  {formatters.datetime
                    .asHMA(new Date(tripPlan.startTime))
                    .slice(-2)}
                </sub>
              </StatNumber>
              {/* <StatHelpText></StatHelpText> */}
            </Stat>
            <Flex
              alignItems={'center'}
              justifyContent="center"
              paddingTop="20px"
            >
              <Icon as={FaArrowRight} boxSize={6} />
            </Flex>
            <Stat>
              <StatLabel>Arrive</StatLabel>
              <StatNumber>
                {formatters.datetime
                  .asHMA(new Date(tripPlan.endTime))
                  .replace('am', '')
                  .replace('pm', '')}
                <sub style={{ textTransform: 'uppercase' }}>
                  {' '}
                  {formatters.datetime
                    .asHMA(new Date(tripPlan.endTime))
                    .slice(-2)}
                </sub>
              </StatNumber>
              {/* <StatHelpText>Stop</StatHelpText> */}
            </Stat>
          </Grid>
          <Flex justifyContent={'flex-start'} mx={6} py={2}>
            {tripModesSet.map((mode, i) => (
              <Box
                as="span"
                key={i.toString()}
                display="flex"
                alignItems="center"
              >
                {mode !== '___' ? (
                  CreateIcon(
                    mode === 'WALK' && wheelchair
                      ? config.WHEELCHAIR.svg
                      : config.MODES.find(m => m.id === mode.toLowerCase()).svg
                  )
                ) : (
                  <Icon
                    as={
                      mode === 'WALK' && wheelchair
                        ? config.WHEELCHAIR.webIcon
                        : config.MODES.find(m => m.id === mode.toLowerCase())
                            .webIcon
                    }
                    boxSize={6}
                  />
                )}

                {i < tripModesSet.length - 1 ? (
                  <Icon as={FaCaretRight} boxSize={6} mr={2} />
                ) : null}
              </Box>
            ))}
          </Flex>
          <Flex alignItems={'center'} fontWeight="bold" px={2}>
            {formatters.datetime.asDuration(tripPlan.duration)}
            <Icon as={FaCircle} boxSize={2} mx={2} />{' '}
            {tripPlan.legs.length > 1 ? 'Includes stops' : 'Direct'}
            <Icon as={FaCircle} boxSize={2} mx={2} /> {tripModesSet.length} mode
            {tripModesSet.length > 1 ? 's' : ''}
          </Flex>
        </CardBody>
      </Card>
    </Box>
  );
};

const TripCardDetail = observer(({ trip, selectedTrip }) => {
  // console.log(toJS(trip));
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
        <Text>{trip?.request?.origin?.title}</Text>
        <Text>{trip?.request?.origin?.description}</Text>
      </CardHeader>
      <CardBody fontWeight={'bold'} py={2}>
        <VerticalTripPlan plan={selectedTrip} />
        {/* {legs.map((leg, i) => (
          <Stack key={i.toString()} spacing={0}>
            <Flex alignItems={'center'} justifyContent={'space-between'} p={2}>
              <Flex alignItems={'center'}>
                <Icon
                  as={leg.mode === 'WALK' ? FaWalking : FaBus}
                  boxSize={6}
                  mr={2}
                />
                <Text>{leg.directions}</Text>
              </Flex>
              <Text>{leg.time}</Text>
            </Flex>
            <Box py={4}>
              <Divider />
            </Box>
          </Stack>
        ))} */}
      </CardBody>
    </Card>
  );
});

function parseDate(d) {
  const date = d || new Date();
  return date.toISOString().split('T')[0];
}

function parseTime(date) {
  const time =
    ('0' + date.getHours()).slice(-2) +
    ':' +
    ('0' + date.getMinutes()).slice(-2);
  return time;
}
