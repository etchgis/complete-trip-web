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
  Badge,
  Tooltip,
} from '@chakra-ui/react';
import { FaArrowRight, FaCaretRight, FaCircle, FaStar, FaExchangeAlt } from 'react-icons/fa';
import { useEffect, useRef } from 'react';

import AddressSearchForm from '../AddressSearchForm';
import { BsFillChatDotsFill } from 'react-icons/bs';
import CreateIcon from '../CreateIcon';
import Tripbot from '../Tripbot';
import VerticalTripPlan from '../VerticalTripPlan';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import config from '../../config';
import formatters from '../../utils/formatters';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { useState } from 'react';
import { useStore } from '../../context/RootStore';
import useTranslation from '../../models/useTranslation';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { getKioskOrigin } from '../../models/kiosk-definitions';

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
          position="fixed"
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
    setOriginExplicitlyCleared(false);
  }, []);

  useEffect(() => {
    setStartError(false);
  }, [locations?.start?.text, setStartError]);

  useEffect(() => {
    setEndError(false);
  }, [locations?.end?.text, setEndError]);

  const setStart = result => {
    trip.updateProperty('id', null);

    setOriginExplicitlyCleared(!result?.text);

    setLocations(current => ({
      ...current,
      start: result,
    }));
  };

  const [originExplicitlyCleared, setOriginExplicitlyCleared] = useState(false);

  // Use the kiosk location as the starting point when in kiosk mode
  useEffect(() => {
    if (ux === 'kiosk' && !locations?.start?.text && !originExplicitlyCleared) {
      const kioskOrigin = getKioskOrigin();
      if (kioskOrigin) {
        setStart(kioskOrigin);
        trip.updateOrigin(kioskOrigin);
      }
    }
  }, [ux, trip, locations?.start?.text, setStart, originExplicitlyCleared]);

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
            defaultGeocoderResult={locations?.start}
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

      {/* Swap between from/to fields */}
      {!trip.isShuttle &&
        <Flex justifyContent="center" my={2}>
          <IconButton
            aria-label="Swap origin and destination"
            icon={<Icon as={FaExchangeAlt} />}
            variant="ghost"
            colorScheme="blue"
            size="lg"
            isRound
            onClick={() => {
              // When swapping to an empty origin, mark it as explicitly cleared
              if (!locations?.end?.text && locations?.start?.text) {
                setOriginExplicitlyCleared(true);
              }

              const startLocation = locations?.start || {};
              const endLocation = locations?.end || {};

              trip.updateOrigin(endLocation);
              trip.updateDestination(startLocation);
              setStart(endLocation);
              setEnd(startLocation);
            }}
            data-test-id="swap-locations-button"
            id="swap-locations-button"
            tabIndex={0}
            onFocus={() => {
              const { uiStore } = useStore();
              uiStore.setFocusedCheckbox('swap-locations-button');
              setKeyboardType(null);
            }}
          />
        </Flex>
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
          defaultGeocoderResult={locations?.end}
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
          {ux === 'kiosk' ? (
            <Box mb={6}>
              <FormLabel>{t('tripWizard.when')}</FormLabel>
              <Flex direction="column" gap={2}>
                <Button
                  variant={whenAction === 'asap' ? 'brand' : 'outline'}
                  size="lg"
                  height="50px"
                  onClick={() => {
                    setWhenAction('asap');
                  }}
                  data-test-id="when-now-button"
                  id="when-button-asap"
                  tabIndex={0}
                  onFocus={() => {
                    store.uiStore.setFocusedCheckbox('when-button-asap');
                  }}
                >
                  {t('tripWizard.now')}
                </Button>
                <Button
                  variant={whenAction === 'leave' ? 'brand' : 'outline'}
                  size="lg"
                  height="50px"
                  onClick={() => {
                    setWhenAction('leave');
                    trip.removeMode('hail');
                  }}
                  data-test-id="when-leave-button"
                  id="when-button-leave"
                  tabIndex={0}
                  onFocus={() => {
                    store.uiStore.setFocusedCheckbox('when-button-leave');
                  }}
                >
                  {t('tripWizard.leaveBy')}
                </Button>
                <Button
                  variant={whenAction === 'arrive' ? 'brand' : 'outline'}
                  size="lg"
                  height="50px"
                  onClick={() => {
                    setWhenAction('arrive');
                    trip.removeMode('hail');
                  }}
                  data-test-id="when-arrive-button"
                  id="when-button-arrive"
                  tabIndex={0}
                  onFocus={() => {
                    store.uiStore.setFocusedCheckbox('when-button-arrive');
                  }}
                >
                  {t('tripWizard.arriveBy')}
                </Button>
              </Flex>
              {/* Hidden select to maintain form compatibility */}
              <Input type="hidden" name="when" value={whenAction} />
            </Box>
          ) : (
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
          )}
        </FormControl>
      }

      {!trip.isShuttle && whenAction !== 'asap' ? (
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
                // setKeyboardType('numeric'); // Disabled to prevent keyboard switching
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
                // setKeyboardType('numeric'); // Disabled to prevent keyboard switching
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
      ) : (
        // Add hidden inputs with default values when not visible
        whenAction !== 'asap' && (
          <>
            <Input type="hidden" name="date" value={parseDate(new Date())} />
            <Input type="hidden" name="time" value={parseTime(new Date())} />
          </>
        )
      )}

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
        <VStack alignItems={'flex-start'} spacing={2}>
          <Checkbox
            isChecked={(() => {
              const availableModes = config.MODES.filter(mode => {
                if (mode.id === 'walk') return false;
                if (mode.id === 'hail') {
                  const selectedDateTime = moment(trip.request.whenTime);
                  const hdsStart = selectedDateTime.clone().hour(config.HDS_HOURS.start[0]).minute(config.HDS_HOURS.start[1]).second(0),
                    hdsEnd = selectedDateTime.clone().hour(config.HDS_HOURS.end[0]).minute(config.HDS_HOURS.end[1]).second(0);
                  const inTimeframe = selectedDateTime.isAfter(hdsStart) && selectedDateTime.isBefore(hdsEnd);
                  return inTimeframe;
                }
                return true;
              });
              return availableModes.length > 0 && availableModes.every(mode => modes.includes(mode.mode));
            })()}
            onChange={(e) => {
              const availableModes = config.MODES.filter(mode => {
                if (mode.id === 'walk') return false;
                if (mode.id === 'hail') {
                  const selectedDateTime = moment(trip.request.whenTime);
                  const hdsStart = selectedDateTime.clone().hour(config.HDS_HOURS.start[0]).minute(config.HDS_HOURS.start[1]).second(0),
                    hdsEnd = selectedDateTime.clone().hour(config.HDS_HOURS.end[0]).minute(config.HDS_HOURS.end[1]).second(0);
                  const inTimeframe = selectedDateTime.isAfter(hdsStart) && selectedDateTime.isBefore(hdsEnd);
                  return inTimeframe;
                }
                return true;
              });

              if (e.target.checked) {
                setModes(availableModes.map(mode => mode.mode));
              } else {
                setModes([]);
              }
            }}
            id="mode-checkbox-select-all"
            onFocus={() => {
              store.uiStore.setFocusedCheckbox('mode-checkbox-select-all');
            }}
            tabIndex={0}
            fontWeight="bold"
          >
            Select All
          </Checkbox>
          <CheckboxGroup onChange={e => setModes(e)} value={modes}>
            {config.MODES.map(mode => {
              const selectedDateTime = moment(trip.request.whenTime);
              const hdsStart = selectedDateTime.clone().hour(config.HDS_HOURS.start[0]).minute(config.HDS_HOURS.start[1]).second(0),
                hdsEnd = selectedDateTime.clone().hour(config.HDS_HOURS.end[0]).minute(config.HDS_HOURS.end[1]).second(0);
              const inTimeframe = selectedDateTime.isAfter(hdsStart) && selectedDateTime.isBefore(hdsEnd);
              if (mode.id === 'hail' && !inTimeframe) return '';
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
  const { confirm, ConfirmDialog } = useConfirmDialog();

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
    // Show confirmation modal before saving
    const confirmed = await confirm({
      title: t('tripWizard.saveTripTitle'),
      message: t('tripWizard.saveTripMessage'),
      confirmText: t('tripWizard.saveTripConfirm'),
      cancelText: t('global.cancel'),
      iconType: 'info',
      variant: 'brand',
      showIcon: true,
    });

    if (confirmed) {
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
  }

  const shuttleLegIndex = selectedTrip?.legs?.findIndex(leg => leg.mode === "HAIL") ?? -1

  function scheduleShuttle() {
    if (shuttleLegIndex === -1 || !selectedTrip?.legs?.[shuttleLegIndex]) return;

    const originLat = selectedTrip.legs[shuttleLegIndex].from.lat;
    const originLng = selectedTrip.legs[shuttleLegIndex].from.lon;
    const originTitle = selectedTrip.legs[shuttleLegIndex].from.name
    const destLat = selectedTrip.legs[shuttleLegIndex].to.lat;
    const destLng = selectedTrip.legs[shuttleLegIndex].to.lon;
    const destTitle = selectedTrip.legs[shuttleLegIndex].to.name

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
      <ConfirmDialog />
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
  const wheelchair = user?.profile?.preferences?.wheelchair;
  const { t } = useTranslation();

  // Create a unique list of modes with their details
  const tripModesWithDetails = [];
  const seenModes = new Set();

  tripPlan.legs.forEach(leg => {
    // Skip walking segments and placeholder modes
    if (leg.mode === '___') return;

    // Create a unique key for each mode/route combination
    const modeKey = `${leg.mode}_${leg.route || ''}_${leg.routeShortName || ''}_${leg.agencyId || leg.providerId || ''}`;

    if (!seenModes.has(modeKey)) {
      seenModes.add(modeKey);
      tripModesWithDetails.push({
        mode: leg.mode,
        route: leg.routeShortName || leg.route || leg.routeId,
        agencyId: leg.agencyId,
        providerId: leg.providerId,
        agencyName: leg.agencyName,
        routeLongName: leg.routeLongName,
      });
    }
  });

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
          <Flex justifyContent={'flex-start'} mx={6} py={2} alignItems={'center'} flexWrap={'wrap'}>
            {tripModesWithDetails.map((leg, i) => {
              const modeName = leg.mode.toLowerCase();
              const isShuttleUB = leg.agencyId?.toLowerCase().includes('ub') ||
                                  leg.providerId?.toLowerCase().includes('ub') ||
                                  modeName === 'ubshuttle';
              const isShuttleHDS = (leg.agencyId?.toLowerCase().includes('nfta') ||
                                   leg.providerId?.toLowerCase().includes('community') ||
                                   modeName === 'hail') && modeName !== 'bus';

              return (
                <Box
                  as="span"
                  key={i.toString()}
                  display="flex"
                  alignItems="center"
                >
                  {CreateIcon(
                    modeName === 'walk' && wheelchair
                      ? config.WHEELCHAIR.svg
                      : config.MODES.find(m => m.id === modeName)?.svg || config.MODES[0].svg
                  )}

                  {/* Add badges for different modes */}
                  {(modeName === 'bus' || modeName === 'tram' || modeName === 'rail' ||
                    leg.mode === 'BUS' || leg.mode === 'TRAM' || leg.mode === 'RAIL') && leg.route && (
                    <Tooltip
                      label={`${modeName === 'tram' ? 'Metro Rail' : modeName === 'rail' ? 'Rail' : 'Bus'} Route ${leg.route}${leg.routeLongName ? `: ${leg.routeLongName}` : ''}`}
                      placement="top"
                      hasArrow
                    >
                      <Badge
                        colorScheme={modeName === 'tram' ? 'orange' : modeName === 'rail' ? 'purple' : 'blue'}
                        fontSize="xs"
                        px={1.5}
                        py={0.5}
                        borderRadius="full"
                        ml={1}
                        mr={2}
                      >
                        {leg.route}
                      </Badge>
                    </Tooltip>
                  )}
                  {modeName === 'car' && (
                    <Tooltip label="Personal Vehicle" placement="top" hasArrow>
                      <Badge
                        colorScheme="cyan"
                        fontSize="xs"
                        px={1.5}
                        py={0.5}
                        borderRadius="full"
                        ml={1}
                        mr={2}
                      >
                        CAR
                      </Badge>
                    </Tooltip>
                  )}
                  {modeName === 'bicycle' && (
                    <Tooltip label="Bicycle" placement="top" hasArrow>
                      <Badge
                        colorScheme="red"
                        fontSize="xs"
                        px={1.5}
                        py={0.5}
                        borderRadius="full"
                        ml={1}
                        mr={2}
                      >
                        BIKE
                      </Badge>
                    </Tooltip>
                  )}
                  {isShuttleUB && (
                    <Tooltip label="Self-Driving Shuttle (UB)" placement="top" hasArrow>
                      <Badge
                        colorScheme="purple"
                        fontSize="xs"
                        px={1.5}
                        py={0.5}
                        borderRadius="full"
                        ml={1}
                        mr={2}
                      >
                        SDS
                      </Badge>
                    </Tooltip>
                  )}
                  {isShuttleHDS && (
                    <Tooltip label="Human-Driven Community Shuttle (NFTA)" placement="top" hasArrow>
                      <Badge
                        colorScheme="green"
                        fontSize="xs"
                        px={1.5}
                        py={0.5}
                        borderRadius="full"
                        ml={1}
                        mr={2}
                      >
                        HDS
                      </Badge>
                    </Tooltip>
                  )}
                  {i < tripModesWithDetails.length - 1 ? (
                    <Icon as={FaCaretRight} boxSize={6} mr={2} />
                  ) : null}
                </Box>
              );
            })}
          </Flex>
          <Flex alignItems={'center'} fontWeight="bold" px={2}>
            {formatters.datetime.asDuration(tripPlan.duration)}
            <Icon as={FaCircle} boxSize={2} mx={2} />{' '}
            {tripPlan.legs.length > 1
              ? t('tripWizard.includesStops')
              : t('tripWizard.direct')}
            <Icon as={FaCircle} boxSize={2} mx={2} /> {tripModesWithDetails.length}{' '}
            {t('tripWizard.mode')}
            {tripModesWithDetails.length > 1 ? 's' : ''}
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
