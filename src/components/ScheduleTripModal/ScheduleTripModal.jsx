import {
  Box,
  Button,
  Card,
  CardBody,
  Checkbox,
  CheckboxGroup,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  HStack,
  Heading,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Select,
  Spinner,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  VStack,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { FaArrowRight, FaCaretRight, FaCircle, FaStar } from 'react-icons/fa';
import { useEffect, useRef } from 'react';

import AddressSearchForm from '../AddressSearchForm';
import CreateIcon from '../CreateIcon';
import VerticalTripPlan from './VerticalTripPlan';
import _ from 'lodash';
import config from '../../config';
import formatters from '../../utils/formatters';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { useState } from 'react';
import { useStore } from '../../context/RootStore';

export const ScheduleTripModal = observer(
  ({ favoriteTrip, isOpen, onClose }) => {
    const [step, setStep] = useState(0);
    const { trip: stagedTrip } = useStore();
    const [selectedTrip, setSelectedTrip] = useState({});
    // console.log(toJS(stagedTrip));
    if (
      favoriteTrip?.origin &&
      favoriteTrip?.destination &&
      favoriteTrip?.id &&
      !stagedTrip.request?.origin?.text &&
      !stagedTrip.request?.destination?.text &&
      !stagedTrip.request?.id
    ) {
      stagedTrip.updateOrigin(favoriteTrip?.origin);
      stagedTrip.updateDestination(favoriteTrip?.destination);
      stagedTrip.updateProperty('id', favoriteTrip?.id);
    }

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
              : ''}
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
  }
);

const First = observer(({ setStep, trip }) => {
  const {
    isOpen: isSaveFavStartOpen,
    onToggle: onToggleStart,
    onClose,
  } = useDisclosure();
  const {
    isOpen: isSaveFavEndOpen,
    onToggle: onToggleEnd,
    onClose: closeSaveFavEnd,
  } = useDisclosure();
  const { locations: favLocations, addLocation } = useStore().favorites;
  const { loggedIn } = useStore().authentication;

  const startRef = useRef(null);
  const endRef = useRef(null);

  const [savedAddresses, setSavedAddresses] = useState({
    start: null,
    end: null,
  });

  const [activeFavorite, setActiveFavorite] = useState(null);
  const [aliasEditor, setAliasEditor] = useState(false);

  const [startError, setStartError] = useState(false);
  const [endError, setEndError] = useState(false);

  const [locations, setLocations] = useState({
    start: trip?.request?.origin || {},
    end: trip?.request?.destination || {},
  });

  useEffect(() => {
    setStartError(false);
  }, [locations?.start?.text, setStartError]);

  useEffect(() => {
    setEndError(false);
  }, [locations?.end?.text, setEndError]);

  const setStart = result => {
    trip.updateProperty('id', null);
    setLocations(current => {
      return {
        ...current,
        start: result,
      };
    });
  };

  const setEnd = result => {
    trip.updateProperty('id', null);
    setLocations(current => {
      return {
        ...current,
        end: result,
      };
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (aliasEditor) return;
    const data = new FormData(e.target);
    //TODO set an error here
    if (!locations?.start?.text) {
      setStartError(true);
      return;
    }
    if (!locations?.end?.text) {
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

  const saveFavorite = async alias => {
    if (!alias) return;
    const favorite = locations[activeFavorite];
    favorite['alias'] = alias;
    const id = addLocation(favorite);
    setActiveFavorite();
    if (activeFavorite === 'end') {
      endRef.current.value = '';
      setSavedAddresses(current => {
        return {
          ...current,
          end: 0,
        };
      });
      setLocations(current => {
        return {
          ...current,
          end: { ...current.end, id: id, alias: alias },
        };
      });
    } else {
      setSavedAddresses(current => {
        return {
          ...current,
          start: 0,
        };
      });
      setLocations(current => {
        startRef.current.value = '';
        return {
          ...current,
          start: { ...current.start, id: id, alias: alias },
        };
      });
    }
    onClose();
    closeSaveFavEnd();
    setAliasEditor(false);
  };

  //DEBUG
  // if (locations?.start?.text) {
  //   console.log(locations?.start);
  //   console.log(toJS(favLocations));
  // }

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
          center={{ lng: -78.878738, lat: 42.88023 }}
          defaultAddress={
            locations?.start?.id &&
            favLocations.find(f => f.id === locations.start.id)
              ? locations?.start?.alias || locations?.start?.text
              : locations?.start?.text || ''
          }
          setGeocoderResult={setStart}
          name="startAddress"
          label="From"
          required={true}
          clearResult={true}
        />
        {/* TODO convert to mini component */}
        <Stack spacing={4} direction="row" alignItems={'center'}>
          {favLocations.find(f => f.id === locations?.start?.id) ? (
            <Flex alignItems="center" m={2} fontSize={'0.9rem'}>
              <Icon as={FaStar} mr={2} boxSize={5} color={'brand'} />{' '}
              <Text fontWeight={'bold'}>Favorite Location</Text>
            </Flex>
          ) : null}
          <Popover
            isOpen={isSaveFavStartOpen}
            onClose={() => {
              //TODO actually save the address
              //TODO replace the location start name with the saved address name
              setSavedAddresses(current => ({ ...current, start: 0 }));
              onClose();
              setAliasEditor(false);
              startRef.current.value = '';
            }}
            placement="bottom"
            closeOnBlur={false}
          >
            <PopoverTrigger>
              <Checkbox
                display={
                  favLocations.find(f => f.id === locations?.start?.id)
                    ? 'none'
                    : 'inline-flex'
                }
                onChange={e => {
                  if (e.target.checked) {
                    onToggleStart();
                    setSavedAddresses(current => ({
                      ...current,
                      start: 1,
                    }));
                    setActiveFavorite('start');
                    setAliasEditor(true);
                  }
                }}
                disabled={!loggedIn ? true : !locations?.start?.text}
                value={
                  favLocations.find(f => f.id === locations?.start?.id)?.id ||
                  ''
                }
                isChecked={!!savedAddresses.start || isSaveFavStartOpen}
                mt={2}
                ml={2}
              >
                Save Address
              </Checkbox>
            </PopoverTrigger>
            <PopoverContent ml={4} mt={2}>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverHeader>Location Name</PopoverHeader>
              {/* <FocusLock returnFocus persistentFocus={false}> */}
              <PopoverBody>
                <Input type="text" ref={startRef} />
                <HStack mt={2}>
                  <Button
                    variant={'solid'}
                    colorScheme="facebook"
                    onClick={() => saveFavorite(startRef.current.value)}
                    w="50%"
                  >
                    Save
                  </Button>
                  <Button
                    variant={'outline'}
                    onClick={() => {
                      setSavedAddresses(current => ({
                        ...current,
                        start: null,
                      }));
                      onClose();
                      setAliasEditor(false);
                      startRef.current.value = '';
                    }}
                    w="50%"
                  >
                    Cancel
                  </Button>
                </HStack>
              </PopoverBody>
              {/* </FocusLock> */}
            </PopoverContent>
          </Popover>
        </Stack>

        <FormErrorMessage>
          Please select a location from the result list.
        </FormErrorMessage>
      </FormControl>

      <FormControl isInvalid={endError}>
        <AddressSearchForm
          saveAddress={() => {}}
          center={{ lng: -78.878738, lat: 42.88023 }}
          defaultAddress={
            locations?.end?.id &&
            favLocations.find(f => f.id === locations.end.id)
              ? locations?.end?.alias || locations?.end?.text
              : locations?.end?.text || ''
          }
          setGeocoderResult={setEnd}
          name="endAddress"
          label="To"
          required={true}
          clearResult={true}
        />

        <Stack spacing={4} direction="row" alignItems={'center'}>
          {favLocations.find(f => f.id === locations?.end?.id) ? (
            <Flex alignItems="center" m={2} fontSize={'0.9rem'}>
              <Icon as={FaStar} mr={2} boxSize={5} color={'brand'} />{' '}
              <Text fontWeight={'bold'}>Favorite Location</Text>
            </Flex>
          ) : null}
          <Popover
            isOpen={isSaveFavEndOpen}
            onClose={() => {
              //TODO actually save the address
              //TODO replace the location start name with the saved address name
              setSavedAddresses(current => ({ ...current, end: null }));
              closeSaveFavEnd();
              setAliasEditor(false);
              endRef.current.value = '';
            }}
            placement="bottom"
            closeOnBlur={false}
          >
            <PopoverTrigger>
              <Checkbox
                display={
                  favLocations.find(f => f.id === locations?.end?.id)
                    ? 'none'
                    : 'inline-flex'
                }
                onChange={e => {
                  if (e.target.checked) {
                    onToggleEnd();
                    setSavedAddresses(current => ({
                      ...current,
                      end: 1,
                    }));
                    setActiveFavorite('end');
                    setAliasEditor(true);
                  }
                }}
                disabled={!loggedIn ? true : !locations?.end?.text}
                isChecked={!!savedAddresses.end || isSaveFavEndOpen}
                value={locations?.end?.id || ''}
                mt={2}
                ml={2}
              >
                Save Address
              </Checkbox>
            </PopoverTrigger>
            <PopoverContent ml={4} mt={2}>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverHeader>Location Name</PopoverHeader>
              {/* <FocusLock returnFocus persistentFocus={false}> */}
              <PopoverBody>
                <Input type="text" ref={endRef} />
                <HStack mt={2}>
                  <Button
                    variant={'solid'}
                    colorScheme="facebook"
                    onClick={() => saveFavorite(endRef.current.value)}
                    w="50%"
                  >
                    Save
                  </Button>
                  <Button
                    variant={'outline'}
                    onClick={() => {
                      setSavedAddresses(current => ({ ...current, end: 0 }));
                      closeSaveFavEnd();
                      setAliasEditor(false);
                      endRef.current.value = '';
                    }}
                    w="50%"
                  >
                    Cancel
                  </Button>
                </HStack>
              </PopoverBody>
              {/* </FocusLock> */}
            </PopoverContent>
          </Popover>
        </Stack>

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
  // console.log(toJS(trip));
  const allowedModes = config.MODES.reduce(
    (acc, mode) => [...acc, mode.mode],
    []
  );
  const _modes = [];
  trip.request.modes.forEach(mode => {
    if (mode !== 'walk') _modes.push(mode);
  });
  // console.log('check modes', _modes);
  const [modes, setModes] = useState(
    _modes.filter(m => m !== 'walk').length
      ? trip.request.modes
      : user?.profile?.preferences?.modes || []
  );
  // const tripModes = toJS(trip.request.modes);
  // console.log('tripModes', tripModes);

  const handleSubmit = e => {
    e.preventDefault();
    setSelectedTrip({});
    const data = new FormData(e.target);
    // console.log([...data]);

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
        !modes.includes(m) && m !== 'walk' ? trip.removeMode(m) : null
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
  console.log({ trip });
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

const Fourth = ({
  setStep,
  selectedTrip,
  trip,
  closeModal,
  setSelectedTrip,
}) => {
  const { loggedIn } = useStore().authentication;
  const { add: saveTrip } = useStore().schedule;
  const toast = useToast();

  async function scheduleTrip() {
    const _request = toJS(trip.request);
    _request.origin['text'] =
      trip.request.origin.title + ' ' + trip.request.origin.description;
    _request.destination['text'] =
      trip.request.destination.title +
      ' ' +
      trip.request.destination.description;
    const updated = await saveTrip(selectedTrip, _request);
    // console.log({ updated });
    if (updated) {
      closeModal();
      toast({
        title: 'Success',
        description: 'Trip Saved',
        status: 'success',
        duration: 1500,
        isClosable: true,
        position: 'top-right',
        variant: 'top-accent',
      });
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
      <VerticalTripPlan
        request={trip.request}
        plan={selectedTrip}
      ></VerticalTripPlan>

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
};

const TripResults = observer(({ setStep, trips, setSelectedTrip }) => {
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
