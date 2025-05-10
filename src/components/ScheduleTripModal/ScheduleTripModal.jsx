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
  IconButton,
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
} from '@chakra-ui/react';
import { FaArrowRight, FaCaretRight, FaCircle, FaStar } from 'react-icons/fa';
import { useEffect, useRef } from 'react';

import AddressSearchForm from '../AddressSearchForm';
import { BsFillChatDotsFill } from 'react-icons/bs';
import CreateIcon from '../CreateIcon';
import Tripbot from '../Tripbot';
import VerticalTripPlan from '../VerticalTripPlan';
import config from '../../config';
import formatters from '../../utils/formatters';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { useState } from 'react';
import { useStore } from '../../context/RootStore';
import useTranslation from '../../models/useTranslation';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

export const ScheduleTripModal = observer(
  ({ favoriteTrip, isOpen, onClose }) => {
    const { trip: stagedTrip } = useStore();
    const { setHasSelectedPlan, ux } = useStore().uiStore;
    const { accessToken } = useStore().authentication;

    const [chatIsActive, setChatIsActive] = useState(false);
    const [step, setStep] = useState(0);
    const [selectedTrip, setSelectedTrip] = useState({});
    const { t } = useTranslation();
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

    if (stagedTrip.isShuttle) {
      console.log('IS SHUTTLE');
    }

    // if (shuttleTrip) {
    //   console.log('ScheduleTripModal', shuttleTrip);
    //   // const { trip: sTrip } = useStore();
    //   // sTrip.updateOrigin(locations.start);
    //   // sTrip.updateDestination(locations.end);
    //   // sTrip.updateWhenAction('asap'); //TODO add leave, arrive
    //   // sTrip.updateWhen(new Date(data.get('date') + ' ' + data.get('time')));
    //   // sTrip.updateWhenAction(data.get('when'));
    //   // sTrip.create();
    // }

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
        name: 'Third', //Trip Cards List
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
        name: 'Fourth', //VerticalTripPlan
        component: (
          <Fourth
            setStep={setStep}
            trip={stagedTrip}
            selectedTrip={selectedTrip}
            closeModal={onClose}
            setSelectedTrip={setSelectedTrip}
            chatIsActive={chatIsActive}
          />
        ),
      },
      {
        name: 'Tripbot',
        component: (
          <Tripbot
            setStep={setStep}
            setSelectedTrip={setSelectedTrip}
            stagedTrip={stagedTrip}
          />
        ),
      },
    ];

    return (
      <Modal
        isOpen={isOpen}
        onClose={() => {
          stagedTrip.create();
          setStep(0);
          onClose();
          setHasSelectedPlan(false);
          setSelectedTrip({});
        }}
        onOpen={() => {
          setStep(0);
          setHasSelectedPlan(false);
          stagedTrip.create();
          setSelectedTrip({});
        }}
        size="full"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent
          textAlign={'center'}
          pt={0}
          pb={ux === 'kiosk' ? '180px' : '0'}
          data-testid="schedule-trip-modal--content"
        >
          <ModalHeader as="h3">
            {step === 0
              ? t('tripWizard.scheduleTrip')
              : step === 1
                ? t('tripWizard.selectTransportation')
                : step === 2
                  ? t('tripWizard.selectTrip')
                  : step === 3
                    ? t('tripWizard.overview')
                    : step === 4 //chatbot
                      ? t('tripWizard.chatbot')
                      : null}
            {accessToken && (step === 0 || step === 4) ? (
              <IconButton
                // display={'none'}
                variant={step === 4 ? 'brand' : 'brand-outline'}
                ml={5}
                fontSize={'xl'}
                icon={<BsFillChatDotsFill />}
                aria-label="Select a Trip Chatbot"
                onClick={async () => {
                  if (step === 4) {
                    stagedTrip.create();
                    setHasSelectedPlan(false);
                    setChatIsActive(false);
                    setStep(0);
                  } else {
                    setStep(4);
                    setChatIsActive(true);
                  }
                }}
              ></IconButton>
            ) : (
              ''
            )}
            <ModalCloseButton p={6} />
          </ModalHeader>
          <ModalBody
            width="auto"
            minW={{ base: '100%', md: '500px' }}
            maxW="100%"
            margin="0 auto"
            display={'flex'}
            flexDir={'column'}
            p={0}
          >
            {Wizard.find((w, i) => i === step).component}
          </ModalBody>
          <ModalFooter justifyContent={'center'}>
            <Button
              color="brand"
              variant={'ghost'}
              onClick={() => {
                setStep(0);
                setHasSelectedPlan(false);
                stagedTrip.create();
                onClose();
              }}
            >
              {t('global.cancel')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }
);

const First = observer(({ setStep, trip, isShuttle = false }) => {
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
  const { ux } = useStore().uiStore;

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

  const [whenAction, setWhenAction] = useState(trip?.request?.whenAction || 'asap');
  const { onScreenKeyboardInput, setKeyboardType, setKeyboardActiveInput, setKeyboardInputValue } = useStore().uiStore;

  useEffect(() => {
    setKeyboardType(null);
  }, []);

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

    console.log({ locations });

    if (trip.isShuttle) {
      trip.updateDestination(locations.end);
      setStep(2);
    }
    else {
      trip.updateOrigin(locations.start);
      trip.updateDestination(locations.end);
      trip.updateWhenAction('asap'); //TODO add leave, arrive
      if (data.get('date') && data.get('time')) {
        // When in kiosk mode, we might have the input values from the on-screen keyboard
        const dateValue = ux === 'kiosk' && onScreenKeyboardInput.date
          ? onScreenKeyboardInput.date
          : data.get('date');
        const timeValue = ux === 'kiosk' && onScreenKeyboardInput.time
          ? onScreenKeyboardInput.time
          : data.get('time');

        trip.updateWhen(new Date(dateValue + ' ' + timeValue));
      }
      else {
        trip.updateWhen(new Date());
      }
      trip.updateWhenAction(data.get('when'));
      setStep(current => current + 1);
    }

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
  const { t } = useTranslation();
  return (
    <Stack
      as="form"
      spacing={6}
      onSubmit={handleSubmit}
      width="100%"
      maxWidth="lg"
      margin={'0 auto'}
      textAlign={'left'}
    >
      {!trip.isShuttle &&
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
            label={t('tripWizard.searchFrom')}
            required={true}
            clearResult={true}
            inputName="startAddress"
          />
          {/* TODO convert to mini component */}
          {(ux === 'webapp' || ux === 'callcenter') &&
            <Stack spacing={4} direction="row" alignItems={'center'}>
              {favLocations.find(f => f.id === locations?.start?.id) ? (
                <Flex alignItems="center" m={2} fontSize={'0.9rem'}>
                  <Icon as={FaStar} mr={2} boxSize={5} color={'brand'} />{' '}
                  <Text fontWeight={'bold'}>
                    {t('settingsFavorites.locations')}
                  </Text>
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
                tabIndex={0}
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
                    {t('tripWizard.saveAddress')}
                  </Checkbox>
                </PopoverTrigger>
                <PopoverContent ml={4} mt={2}>
                  <PopoverArrow />
                  <PopoverCloseButton />
                  <PopoverHeader>{t('tripWizard.addressName')}</PopoverHeader>
                  {/* <FocusLock returnFocus persistentFocus={false}> */}
                  <PopoverBody>
                    <Input
                      type="text"
                      ref={startRef}
                      placeholder={t('tripWizard.addressName')}
                    />
                    <HStack mt={2}>
                      <Button
                        variant={'solid'}
                        colorScheme="facebook"
                        onClick={() => saveFavorite(startRef.current.value)}
                        w="50%"
                      >
                        {t('global.save')}
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
                        {t('global.cancel')}
                      </Button>
                    </HStack>
                  </PopoverBody>
                  {/* </FocusLock> */}
                </PopoverContent>
              </Popover>
            </Stack>
          }

          <FormErrorMessage>
            Please select a location from the result list.
          </FormErrorMessage>
        </FormControl>
      }

      <FormControl isInvalid={endError}>
        <AddressSearchForm
          saveAddress={() => { }}
          center={{ lng: -78.878738, lat: 42.88023 }}
          defaultAddress={
            locations?.end?.id &&
              favLocations.find(f => f.id === locations.end.id)
              ? locations?.end?.alias || locations?.end?.text
              : locations?.end?.text || ''
          }
          setGeocoderResult={setEnd}
          name="endAddress"
          label={t('tripWizard.searchTo')}
          required={true}
          clearResult={true}
          inputName="endAddress"
          autoFocus={ux === 'kiosk'}
        />

        {(ux === 'webapp' || ux === 'callcenter') &&
          <Stack spacing={4} direction="row" alignItems={'center'}>
            {favLocations.find(f => f.id === locations?.end?.id) ? (
              <Flex alignItems="center" m={2} fontSize={'0.9rem'}>
                <Icon as={FaStar} mr={2} boxSize={5} color={'brand'} />{' '}
                <Text fontWeight={'bold'}>{t('tripWizard.favorite')}</Text>
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
              tabIndex={0}
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
                  {t('tripWizard.saveAddress')}
                </Checkbox>
              </PopoverTrigger>
              <PopoverContent ml={4} mt={2}>
                <PopoverArrow />
                <PopoverCloseButton />
                <PopoverHeader>{t('tripWizard.addressName')}</PopoverHeader>
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
                      {t('global.save')}
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
                      {t('global.cancel')}
                    </Button>
                  </HStack>
                </PopoverBody>
                {/* </FocusLock> */}
              </PopoverContent>
            </Popover>
          </Stack>
        }

        <FormErrorMessage>{t('errors.pleaseSelectLocation')}</FormErrorMessage>
      </FormControl>

      {!trip.isShuttle &&
        <FormControl isRequired mt={10}>
          <Select
            name="when"
            mb={6}
            defaultValue={whenAction}
            onChange={(e) => {
              console.log(e.target.value);
              setWhenAction(e.target.value);
              if (e.target.value !== 'asap') {
                trip.removeMode('hail');
              }
            }}
          >
            <option value="asap">{t('tripWizard.now')}</option>
            <option value="leave">{t('tripWizard.leaveBy')}</option>
            <option value="arrive">{t('tripWizard.arriveBy')}</option>
          </Select>
        </FormControl>
      }

      {!trip.isShuttle && whenAction !== 'asap' &&
        <FormControl isRequired>
          <FormLabel>{t('tripWizard.selectDate')}</FormLabel>
          {ux === 'kiosk' ? (
            <Input
              type="text"
              pattern="\d{4}-\d{2}-\d{2}"
              placeholder="YYYY-MM-DD"
              defaultValue={parseDate(trip?.request?.whenTime)}
              name="date"
              value={onScreenKeyboardInput.date || parseDate(trip?.request?.whenTime)}
              onChange={(e) => {
                setKeyboardInputValue(e.target.value);
              }}
              onFocus={() => {
                setKeyboardActiveInput('date');
                setKeyboardType('numeric');
              }}
              data-testid="schedule-trip-date-input"
            />
          ) : (
            <Input
              type="date"
              defaultValue={parseDate(trip?.request?.whenTime)}
              name="date"
              data-testid="schedule-trip-date-input"
            />
          )}
          <FormLabel>{t('tripWizard.time')}</FormLabel>
          {ux === 'kiosk' ? (
            <Input
              type="text"
              pattern="[0-2][0-9]:[0-5][0-9]"
              placeholder="HH:MM"
              defaultValue={parseTime(trip?.request?.whenTime)}
              name="time"
              value={onScreenKeyboardInput.time || parseTime(trip?.request?.whenTime)}
              onChange={(e) => {
                setKeyboardInputValue(e.target.value);
              }}
              onFocus={() => {
                setKeyboardActiveInput('time');
                setKeyboardType('numeric');
              }}
              data-testid="schedule-trip-time-input"
            />
          ) : (
            <Input
              type="time"
              defaultValue={parseTime(trip?.request?.whenTime)}
              name="time"
              data-testid="schedule-trip-time-input"
            />
          )}
        </FormControl>
      }

      <Button width="100%" variant="brand" type="submit">
        {t('global.next')}
      </Button>
    </Stack>
  );
});

const Second = observer(({ setStep, trip, setSelectedTrip }) => {
  const { t } = useTranslation();
  const store = useStore();
  const { user } = store.authentication;
  const { setKeyboardType } = store.uiStore;
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

  useEffect(() => {
    setKeyboardType(null);
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    setSelectedTrip({});
    const data = new FormData(e.target);
    // console.log([...data]);

    if (data.get('riders')) {
      trip.updateProperty('riders', +data.get('riders'));
    }
    if (data.get('caretaker')) {
      trip.updateProperty('caretaker', data.get('caretaker'));
    }
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

  // const setCaretaker = e => {
  //   trip.updateProperty('caretaker', e.target.value);
  // };

  return (
    <Stack
      as="form"
      spacing={6}
      width="100%"
      maxWidth="lg"
      margin={'0 auto'}
      textAlign={'left'}
      onSubmit={handleSubmit}
    >
      <FormControl>
        <FormLabel>{t('tripWizard.modes')}</FormLabel>
        <VStack alignItems={'flex-start'}>
          <CheckboxGroup onChange={e => setModes(e)} defaultValue={modes}>
            {config.MODES.map(mode => {
              const selectedDateTime = moment(trip.request.whenTime);
              const hdsStart = moment().hour(config.HDS_HOURS.start[0]).minute(config.HDS_HOURS.start[1]).second(0),
                hdsEnd = moment().hour(config.HDS_HOURS.end[0]).minute(config.HDS_HOURS.end[1]).second(0);
              const inTimeframe = selectedDateTime.isAfter(hdsStart) && selectedDateTime.isBefore(hdsEnd);
              if (mode.id === 'hail' && (!inTimeframe || trip.request.whenAction !== 'asap')) return '';
              if (mode.id === 'walk') return '';
              return (
                <Checkbox
                  key={mode.id}
                  value={mode.mode}
                  id={`mode-checkbox-${mode.id}`}
                  onFocus={() => {
                    store.uiStore.setFocusedCheckbox(`mode-checkbox-${mode.id}`);
                  }}
                  tabIndex={0} // Make sure checkbox is focusable
                >
                  {t(`settingsPreferences.${mode.id}`)}
                </Checkbox>
              );
            })}
          </CheckboxGroup>
        </VStack>
      </FormControl>

      {/* <FormControl>
        <FormLabel>How Many People are Riding?</FormLabel>
        <Select name="riders" defaultValue={trip?.request?.riders}>
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4</option>
        </Select>
      </FormControl> */}

      {/* <FormControl>
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
      </FormControl> */}

      <Button type="submit" variant={'brand'}>
        {t('global.next')}
      </Button>
      <Button onClick={() => setStep(current => current - 1)}>
        {t('global.prev')}
      </Button>
    </Stack>
  );
});

const Third = observer(({ setStep, setSelectedTrip, selectedTrip }) => {
  const { trip } = useStore();
  const { t } = useTranslation();
  console.log('[schedule trip modal] Third\n', { trip });
  const { setKeyboardType } = useStore().uiStore;

  useEffect(() => {
    setKeyboardType(null);
  }, []);

  useEffect(() => {
    console.log('KEYS', !Object.keys(selectedTrip).length);
    if (!Object.keys(selectedTrip).length) {
      console.log('Generating Plans');
      trip.generatePlans();
    }
    //eslint-disable-next-line
  }, []);

  return (
    <Stack
      spacing={6}
      width="100%"
      maxWidth="lg"
      margin={'0 auto'}
      textAlign={'left'}
    >
      <VStack spacing={6}>
        {trip.generatingPlans ? (
          <>
            <Heading as="p" size="sm">
              {t('tripWizard.generatingPlans')}
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
            trip={trip}
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
        {t('global.next')}
      </Button> */}
      <Button onClick={() => setStep(current => (current - (trip.isShuttle ? 2 : 1)))}>
        {t('global.prev')}
      </Button>
    </Stack>
  );
});

const Fourth = ({
  setStep,
  selectedTrip,
  trip,
  closeModal,
  setSelectedTrip,
  chatIsActive,
}) => {
  const { setToastMessage, setToastStatus, setHasSelectedPlan, setKeyboardType } =
    useStore().uiStore;
  const { add: saveTrip } = useStore().schedule;
  const { t } = useTranslation();

  const navigate = useNavigate()

  useEffect(() => {
    setKeyboardType(null);
  }, []);
  // //------------------DEBUG------------------//
  // const _selectedTrip = toJS(selectedTrip);
  // const _stagedTrip = toJS(trip);
  // console.log({ _stagedTrip });
  // console.log({ _selectedTrip });
  // //------------------DEBUG------------------//

  async function scheduleTrip() {
    const _request = toJS(trip.request);
    _request.origin['text'] =
      trip.request.origin.title + ' ' + trip.request.origin.description;
    _request.destination['text'] =
      trip.request.destination.title +
      ' ' +
      trip.request.destination.description;
    const updated = await saveTrip(selectedTrip, _request);
    console.log({ updated });
    if (updated) {
      closeModal();

      setToastStatus('success');
      setToastMessage(t('tripWizard.tripScheduled'));

      setHasSelectedPlan(false);
      setSelectedTrip({});

      trip.create();

      setStep(0);
    }
  }

  const shuttleLegIndex = trip.plans[0].legs.findIndex(leg => leg.mode === "HAIL")

  function scheduleShuttle() {

    const originLat = trip.plans[0].legs[shuttleLegIndex].from.lat;
    const originLng = trip.plans[0].legs[shuttleLegIndex].from.lon;
    const originTitle = trip.plans[0].legs[shuttleLegIndex].from.name
    const destLat = trip.plans[0].legs[shuttleLegIndex].to.lat;
    const destLng = trip.plans[0].legs[shuttleLegIndex].to.lon;
    const destTitle = trip.plans[0].legs[shuttleLegIndex].to.name

    const url = `${config.SERVICES.dispatch}#origin_title=${originTitle}&origin_lat=${originLat}
    &origin_lng=${originLng}&dest_title=${destTitle}&dest_lat=${destLat}&dest_lng=${destLng}`;

    window.open(url);

    closeModal();
    setStep(0);
    navigate("/callcenter")
  };

  const scheduleShuttleHandler = shuttleLegIndex !== -1 ? scheduleShuttle : null

  // console.log(toJS(trip));
  return (
    <Stack
      as="form"
      spacing={6}
      width="100%"
      margin={'0 auto'}
      textAlign={'left'}
      flex={1}
      overflow={'hidden'}
      id="vertical-trip-plan-form"
    >
      <VerticalTripPlan
        tripRequest={trip.request}
        tripPlan={selectedTrip}
        scheduleTripHandler={scheduleTrip}
        scheduleShuttleHandler={scheduleShuttleHandler}
        backClickHandler={() => {
          if (chatIsActive) {
            trip.create();
            setHasSelectedPlan(false);
            setStep(4);
          } else {
            setStep(current => current - 1);
          }
        }}

      ></VerticalTripPlan>
    </Stack>
  );
};

const TripResults = observer(({ setStep, trips, setSelectedTrip }) => {
  const { t } = useTranslation();
  return (
    <>
      {trips.length ? (
        trips.map((t, i) => (
          <TripCard
            setStep={setStep}
            tripPlan={t}
            index={i}
            key={i.toString()}
            setSelectedTrip={setSelectedTrip}
          />
        ))
      ) : (
        <Text tabIndex={0}>{t('tripWizard.noTrips')}</Text>
      )}
    </>
  );
});

const TripCard = ({ setStep, tripPlan, index, setSelectedTrip }) => {
  const { user } = useStore().authentication;
  const tripModes = tripPlan.legs.reduce((acc, leg) => [...acc, leg.mode], []);
  const tripModesSet = Array.from(new Set(tripModes));
  const wheelchair = user?.profile?.preferences?.wheelchair;
  const { t } = useTranslation();
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
              <StatLabel>{t('tripWizard.leave')}</StatLabel>
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
              <StatLabel>{t('tripWizard.arrive')}</StatLabel>
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
            {tripPlan.legs.length > 1
              ? t('tripWizard.includesStops')
              : t('tripWizard.direct')}
            <Icon as={FaCircle} boxSize={2} mx={2} /> {tripModesSet.length}{' '}
            {t('tripWizard.mode')}
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
