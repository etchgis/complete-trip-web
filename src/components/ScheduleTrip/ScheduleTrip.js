import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  CheckboxGroup,
  Divider,
  Flex,
  FormControl,
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
  Stack,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FaArrowRight,
  FaBus,
  FaChevronRight,
  FaCircle,
  FaGenderless,
  FaWalking,
} from 'react-icons/fa';

import AddressSearchForm from '../AddressSearchForm';
import { ChevronRightIcon } from '@chakra-ui/icons';
import config from '../../config';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useState } from 'react';
import { useStore } from '../../context/mobx/RootStore';

// TODO on coming from a favorite - add in Leave By and Number of Riders to Trip Options
// TODO add Leave Now, Leave By and Arrive By
// TODO sort by start time for results
export const ScheduleTrip = observer(() => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box p={6}>
      {/* {isOpen ? (
        <TripBox></TripBox>
      ) : (
        <> */}
      <Heading as="h2" size="md" mb={6}>
        Schedule a Trip
      </Heading>
      <Flex mb={6}>
        <Button p={10} colorScheme="blue" onClick={onOpen}>
          New Trip <Icon as={ChevronRightIcon} ml={2} boxSize={6} />
        </Button>
      </Flex>
      <Box>Map</Box>
      <TripModal isOpen={isOpen} onClose={onClose}></TripModal>
      {/* </> */}
      {/* // )} */}
    </Box>
  );
});

const TripModal = observer(({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);
  const [stagedTrip, setStagedTrip] = useState({});

  const Wizard = [
    {
      name: 'First',
      component: (
        <First setStep={setStep} trip={stagedTrip} setTrip={setStagedTrip} />
      ),
    },
    {
      name: 'Second',
      component: (
        <Second setStep={setStep} trip={stagedTrip} setTrip={setStagedTrip} />
      ),
    },
    {
      name: 'Test',
      component: (
        <Test setStep={setStep} trip={stagedTrip} setTrip={setStagedTrip} />
      ),
    },
    {
      name: 'Third',
      component: (
        <Third setStep={setStep} trip={stagedTrip} setTrip={setStagedTrip} />
      ),
    },
    {
      name: 'Fourth',
      component: (
        <Fourth setStep={setStep} trip={stagedTrip} setTrip={setStagedTrip} />
      ),
    },
  ];

  useEffect(() => {
    console.log('step', step);
  }, [step]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setStep(0);
        onClose();
        setStagedTrip({});
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
              setStagedTrip({});
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

const First = observer(({ setStep, trip, setTrip }) => {
  const [locations, setLocations] = useState({
    start: trip?.start || {},
    end: trip?.end || {},
  });

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
    console.log('submit');
    const data = new FormData(e.target);
    setTrip(current => {
      return {
        ...current,
        start: locations.start,
        end: locations.end,
        date: data.get('date'),
        time: data.get('time'),
      };
    });
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
      <FormControl>
        <AddressSearchForm
          saveAddress={() => {}}
          center={[-78.878738, 42.88023]}
          defaultAddress={locations?.start?.title || ''}
          setGeocoderResult={setStart}
          name="startAddress"
          label="From"
        />
      </FormControl>

      <FormControl>
        <AddressSearchForm
          saveAddress={() => {}}
          center={[-78.878738, 42.88023]}
          defaultAddress={locations?.end?.title || ''}
          setGeocoderResult={setEnd}
          name="endAddress"
          label="To"
        />
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Select a Date</FormLabel>
        <Input
          type="date"
          defaultValue={trip?.date || '2023-01-01'}
          name="date"
        ></Input>
      </FormControl>

      <FormControl isRequired>
        <FormLabel>Time</FormLabel>
        <Input
          type="time"
          defaultValue={trip?.time || '13:00:00'}
          name="time"
        ></Input>
      </FormControl>
      <Box>Leave Now/Leave By / Arrive By</Box>
      <Button width="100%" colorScheme={'blue'} type="submit">
        Next
      </Button>
    </Stack>
  );
});

const Second = observer(({ setStep, trip, setTrip }) => {
  console.log(trip);
  const [modes, setModes] = useState(trip?.modes || []);
  console.log(modes);
  const handleSubmit = e => {
    e.preventDefault();
    const data = new FormData(e.target);
    console.log([...data]);
    setTrip(current => {
      return {
        ...current,
        modes: modes,
        riders: +data.get('riders'),
        caretaker: data.get('caretaker'),
      };
    });
    setStep(current => current + 1);
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
            <Checkbox value="public">Public</Checkbox>
            <Checkbox value="shuttle">Shuttle</Checkbox>
            <Checkbox value="rideshare">Rideshare</Checkbox>
            <Checkbox value="private">Private</Checkbox>
          </CheckboxGroup>
        </VStack>
      </FormControl>

      <FormControl>
        <FormLabel>How Many People are Riding?</FormLabel>
        <Select name="riders" defaultValue={trip?.riders}>
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4</option>
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>Select a Caretaker</FormLabel>
        <Select name="caretaker" defaultValue={trip?.caretaker}>
          <option>A</option>
          <option>B</option>
          <option>C</option>
        </Select>
      </FormControl>

      <Button type="submit" colorScheme="blue">
        Next
      </Button>
      <Button onClick={() => setStep(current => current - 1)}>Back</Button>
    </Stack>
  );
});

const Test = ({ setStep, trip }) => {
  return (
    <Stack spacing={4} textAlign="left">
      <Box>
        <pre>{JSON.stringify(trip, null, 2)}</pre>
      </Box>
      <Button
        onClick={() => setStep(current => current + 1)}
        colorScheme="blue"
      >
        Next
      </Button>
      <Button onClick={() => setStep(current => current - 1)}>Back</Button>
    </Stack>
  );
};

const Third = observer(({ setStep, trip, setTrip }) => {
  console.log(trip);
  return (
    <Stack spacing={6} maxWidth="lg" margin={'0 auto'} textAlign={'left'}>
      <VStack spacing={6}>
        <TripCard setTrip={setTrip} setStep={setStep}></TripCard>
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

const Fourth = observer(({ setStep, trip }) => {
  const { loggedIn } = useStore().authentication;

  const geojson = {
    type: 'Feature',
    properties: {
      stroke: '#00aaff',
      'stroke-width': 4,
    },
    geometry: {
      type: 'LineString',
      coordinates: [
        [-78.82027684802185, 42.872201000486314],
        [-78.83891247993591, 42.87929370916919],
        [-78.8723363874973, 42.88502014614832],
        [-78.86921041053135, 42.895062152056255],
        [-78.86722661745672, 42.90061098021232],
        [-78.86536305426509, 42.90061098021232],
      ],
    },
  };
  return (
    <Stack
      as="form"
      spacing={6}
      width={{ base: '100%', md: '1000px' }}
      maxWidth="2xl"
      margin={'0 auto'}
      textAlign={'left'}
    >
      <Grid
        gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }}
        gap={6}
        position="relative"
      >
        <Box
          position={'relative'}
          width={{ base: '100%', md: '324px' }}
          maxW="100%"
        >
          <Heading as="h3" size="md" mb={2}>
            Mon, Jan 30, 2023
          </Heading>
          <Text>Home to Hospital</Text>
          <Flex
            position="absolute"
            zIndex={2}
            w={{ base: '324px', md: '100%' }}
            maxW="100%"
          >
            <Box
              borderRadius={'2xl'}
              h="80px"
              w="80%"
              background={
                'linear-gradient(90deg, hsl(202deg 100% 60%), hsl(240deg 46% 61%) 100%)'
              }
              mt={'40px'}
              mx="auto"
            ></Box>
          </Flex>

          <Image
            src={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/geojson(${encodeURIComponent(
              JSON.stringify(geojson)
            )})/auto/324x400?padding=50,10&before_layer=waterway-label&access_token=${
              config.MAP.MAPBOX_TOKEN
            }`}
            alt="map"
            borderRadius={'md'}
            margin={{ base: '60px 0', md: 'calc(calc(100% - 200px) / 2) 0' }}
          />
        </Box>
        <TripCardDetail trip={trip}></TripCardDetail>
      </Grid>
      <Stack spacing={6} alignItems="center">
        <Button
          onClick={() => {}}
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
});

const TripCard = observer(({ setTrip, setStep }) => {
  const results = [
    {
      start: {
        time: '6:30 AM',
        stop: 'Stop A',
      },
      end: { time: '7:01 AM', stop: 'Hospital' },
      cost: '$5.00',
      stops: true,
      duration: '31 min',
    },
    {
      start: {
        time: '8:30 AM',
        stop: 'Stop 75',
      },
      end: { time: '8:45 AM', stop: 'Hospital' },
      cost: '$2.00',
      stops: false,
      duration: '15 min',
    },
  ];

  return (
    <>
      {results.map((result, i) => (
        <Card
          size={'sm'}
          width="100%"
          key={i.toString()}
          _hover={{
            cursor: 'pointer',
            boxShadow: 'lg',
          }}
          as="button"
          onClick={() => {
            setTrip(current => {
              return {
                ...current,
                trip: result,
              };
            });
            setStep(current => current + 1);
          }}
        >
          <CardBody width="100%">
            <Grid gridTemplateColumns={'20% 40px 20% calc(60% - 20px)'}>
              <Stat>
                <StatLabel>Leave</StatLabel>
                <StatNumber>
                  {result.start.time.split(/ /)[0]}{' '}
                  <sub>{result.start.time.split(/ /)[1]}</sub>
                </StatNumber>
                <StatHelpText>{result.start.stop}</StatHelpText>
              </Stat>
              <Flex alignItems={'center'}>
                <Icon as={FaArrowRight} boxSize={6} />
              </Flex>
              <Stat>
                <StatLabel>Arrive</StatLabel>
                <StatNumber>
                  {result.end.time.split(/ /)[0]}{' '}
                  <sub>{result.end.time.split(/ /)[1]}</sub>
                </StatNumber>
                <StatHelpText>{result.end.stop}</StatHelpText>
              </Stat>
              <Flex justifyContent={'flex-end'} mx={6} py={2}>
                <Icon as={FaWalking} boxSize={6} mr={2} />
                <Icon as={FaChevronRight} boxSize={6} mr={2} />
                <Icon as={FaBus} boxSize={6} />
              </Flex>
            </Grid>
            <Flex alignItems={'center'} fontWeight="bold">
              {result?.duration || '32min'}{' '}
              <Icon as={FaCircle} boxSize={2} mx={2} />{' '}
              {result.stops ? 'Includes stops' : 'Direct'}
              <Icon as={FaCircle} boxSize={2} mx={2} />{' '}
              {result?.cost || '$5.00'}
            </Flex>
          </CardBody>
        </Card>
      ))}
    </>
  );
});

const TripCardDetail = observer(({ trip }) => {
  const legs = [
    {
      time: '6:20 AM',
      directions: 'Walk to Stop A',
      mode: 'WALK',
    },
    {
      time: '6:31 AM',
      directions: 'Bus 1 to Hospital',
      mode: 'BUS',
    },
    {
      time: '7:01 AM',
      directions: 'Walk to Hospital',
      mode: 'WALK',
      destination: "John R. Oishei Children's Hospital",
      address: '818 Ellicott St, Buffalo, NY 14203',
    },
  ];
  return (
    <Card size="lg" borderRadius={'md'}>
      <CardHeader pb={2}>
        <Heading size="sm" as="h4" mb={2}>
          Directions
        </Heading>
        <Text>{legs[legs.length - 1]?.destination}</Text>
        <Text>{legs[legs.length - 1]?.address}</Text>
      </CardHeader>
      <CardBody fontWeight={'bold'}>
        <Text display={'flex'} alignItems="center" px={2}>
          <Icon as={FaGenderless} boxSize={6} mr={2} />
          Leave By {legs[0].time}
        </Text>
        <Box py={4}>
          <Divider />
        </Box>
        {legs.map((leg, i) => (
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
        ))}
      </CardBody>
    </Card>
  );
});

// const TripBox = observer(({ isOpen, onClose }) => {
//   const [step, setStep] = useState(0);
//   const Wizard = [
//     {
//       name: 'First',
//       component: <First setStep={setStep} />,
//     },
//     {
//       name: 'Second',
//       component: <Second setStep={setStep} />,
//     },
//     {
//       name: 'Third',
//       component: <Third setStep={setStep} />,
//     },
//     {
//       name: 'Fourth',
//       component: <Fourth setStep={setStep} />,
//     },
//   ];

//   useEffect(() => {
//     console.log('step', step);
//   }, [step]);

//   return (
//     <Box>
//       <Heading as="h3" size="md">
//         {step === 0
//           ? 'Schedule a Trip'
//           : step === 1
//           ? 'Select your Transportation'
//           : step === 2
//           ? 'Select a Trip'
//           : 'Trip Details'}
//       </Heading>

//       <Box>{Wizard.find((w, i) => i === step).component}</Box>

//       <Button colorScheme="blue" variant={'ghost'} onClick={onClose}>
//         Cancel Trip
//       </Button>
//     </Box>
//   );
// });
