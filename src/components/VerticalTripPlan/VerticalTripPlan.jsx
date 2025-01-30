import { Box, Button, Center, Flex, FormControl, FormLabel, IconButton, Input, PinInput, PinInputField, Stack, Text, VStack, useColorMode } from '@chakra-ui/react';

import { TripPlanMap } from './TripPlanMap';
import { TripPlanSchedule } from './TripPlanSchedule';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { useStore } from '../../context/RootStore';
import useTranslation from '../../models/useTranslation';
import { useEffect, useRef, useState } from 'react';
import { CloseIcon } from '@chakra-ui/icons';
import rides from '../../services/transport/rides';
import { result, set } from 'lodash';
import useIntervalHook from '../../hooks/useIntervalHook';

export const VerticalTripPlan = observer(
  ({
    tripPlan,
    tripRequest,
    rider,
    scheduleTripHandler,
    backClickHandler,
    cancelClickHandler,
    summonShuttleHandler,
    scheduleShuttleHandler,
  }) => {
    const { colorMode } = useColorMode();
    const { trip } = useStore();
    const { ux, activeInput, setKeyboardActiveInput, getKeyboardInputValue, onScreenKeyboardInput, setKeyboardType } = useStore().uiStore;
    const { t } = useTranslation();
    const [pin, setPin] = useState('');
    const [areaCode, setAreaCode] = useState('');
    const [phone1, setPhone1] = useState('');
    const [phone2, setPhone2] = useState('');
    const [error, setError] = useState('');
    const [shuttleSuccess, setShuttleSuccess] = useState(false);
    const [showSummon, setShowSummon] = useState(false);
    const [timerStarted, setTimerStarted] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(10);

    useIntervalHook(
      () => {
        if (secondsLeft > 0) {
          setSecondsLeft(secondsLeft - 1)
        } else {
          setTimerStarted(false);
          window.location.reload();
        }
      },
      timerStarted ? 1000 : null
    );

    const handleSummonShuttle = () => {
      setShowSummon(true);
    }

    useEffect(() => {
      if (ux !== 'kiosk') return;
      console.log('[PIN] setting pin');
      if ('pin' !== activeInput && 'areaCode' !== activeInput && 'phone1' !== activeInput && 'phone2' !== activeInput) return;
      if ('pin' === activeInput) setPin(getKeyboardInputValue('pin'));
      if ('areaCode' === activeInput) setAreaCode(getKeyboardInputValue('areaCode'));
      if ('phone1' === activeInput) setPhone1(getKeyboardInputValue('phone1'));
      if ('phone2' === activeInput) setPhone2(getKeyboardInputValue('phone2'));
      // if ('pin' !== activeInput && 'phone' !== activeInput) return;
      setPin(getKeyboardInputValue('pin'));
    }, [onScreenKeyboardInput, ux]);

    useEffect(() => {
      setKeyboardType('numeric')
    }, []);

    const handleSummonPress = () => {
      if (pin.length !== 4 || areaCode.length !== 3 || phone1.length !== 3 || phone2.length !== 4) {
        setError(t('tripWizard.popUpError'));
      }
      else {
        setError('');
        const organizationId = '3738f2ea-ddc0-4d86-9a8a-4f2ed531a486',
          driverId = null,
          // driverId = 'd95c52b6-ee0d-44f1-9148-7c77971a4653',
          datetime = Date.now(),
          passengers = 1;
        // const pickup = trip.request.origin;
        // TODO: get proper pickup coordinates from the URL
        const pickup = {
          title: 'BGMC Main Entrance',
          address: '100 High St, Buffalo, NY 14203',
          coordinates: [-78.86680135060003, 42.90038260885757],
        };
        const dropoff = {
          title: trip.request.destination.title,
          address: trip.request.destination.address,
          coordinates: [
            trip.request.destination.point.lng,
            trip.request.destination.point.lat
          ]
        };
        rides.request(
          organizationId,
          datetime,
          'leave',
          pickup,
          dropoff,
          driverId,
          passengers,
          `+1${areaCode}${phone1}${phone2}`,
          pin
        )
          .then((result) => {
            console.log('SUMMONED RESULT:', result);
            setShuttleSuccess(t('tripWizard.popUpSuccess'));
            setPin('');
            setAreaCode('');
            setPhone1('');
            setPhone2('');
            setShowSummon(false);
            setTimerStarted(true);
          })
          .catch((e) => {
            if (e === 'invalid pin' || e === 'user not found for this phone number') {
              setError(t('tripWizard.popUpError'));
            }
            else {
              setError(t('tripWizard.popUpUnknownError'));
            }
          })
      }
    }

    const kioskTopHeight = 700;
    const kioskBottomHeight = 255;
    // const kioskMiddleHeight = 1920 - kioskTopHeight - kioskBottomHeight;
    const headerHeight = 60;

    return (
      <>
        {ux === 'kiosk' && showSummon &&
          <Flex
            background={'white'}
            position={'absolute'}
            zIndex={3}
            top={`${kioskBottomHeight + headerHeight + 20}px`}
            left="50%"
            transform="translate(-50%, -50%)"
            h="500px"
            w="700px"
            paddingX={'40px'}
            paddingTop={'110px'}
            paddingBottom={'60px'}
            alignItems={'center'}
            justifyContent={'center'}
            borderRadius={'md'}
            boxShadow={'md'}
          >
            <IconButton
              onClick={() => setShowSummon(false)}
              aria-label={t('global.close')}
              icon={<CloseIcon />}
              pos={'absolute'}
              top={4}
              right={4}
              variant={'ghost'}
            />
            <Box>
              <Text
                style={{
                  position: 'absolute',
                  top: '40px',
                  left: '70px',
                  right: '70px',
                  textAlign: 'center',
                  color: 'red',
                }}
              >{error}</Text>
              <VStack>
                <Text
                  fontSize={'xl'}
                  mb={'10px'}
                >{t('tripWizard.popUpTitle')}</Text>

                <FormControl mb={'20px'}>
                  <FormLabel textAlign={'center'}>{t('tripWizard.popUpPin')}</FormLabel>
                  <Center w={'100%'}>
                    <Input
                      type="number"
                      w={'100px'}
                      letterSpacing={'10px'}
                      onChange={(e) => {
                        console.log('e:', e);
                      }}
                      inputName={'pin'}
                      onFocus={(e) => {
                        e.target.select();
                        setKeyboardActiveInput('pin')
                      }}
                      value={pin}
                      maxLength={4}
                      autoComplete='off'
                    />
                    {/* <PinInput
                      otp
                      // onChange={(e) => {
                      //   // setPin(e);
                      // }}
                      // name={'pin'}
                      size="lg"
                    >
                      <PinInputField
                      name='pin'
                        mx={2}
                        onFocus={(e) => {
                          e.target.select();
                          setKeyboardActiveInput('pin');
                        }}
                        onChange={(e) => {
                          setPin(e.target.value);
                        }}
                        value={pin} />
                      <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                      <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                      <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                    </PinInput> */}
                  </Center>
                </FormControl>

                <FormControl mb={'40px'}>
                  <FormLabel textAlign={'center'}>{t('tripWizard.popUpPhone')}</FormLabel>
                  <Center w={'100%'}>
                    <Input
                      type="number"
                      w={'82px'}
                      letterSpacing={'10px'}
                      onChange={(e) => {
                        console.log('e:', e);
                      }}
                      inputName={'areaCode'}
                      onFocus={(e) => {
                        e.target.select();
                        setKeyboardActiveInput('areaCode')
                      }}
                      value={areaCode}
                      maxLength={3}
                      autoComplete='off'
                    />
                    <Text mx={'10px'} fontSize={'28px'}>-</Text>
                    <Input
                      type="number"
                      w={'82px'}
                      letterSpacing={'10px'}
                      onChange={(e) => {
                        console.log('e:', e);
                      }}
                      inputName={'phone1'}
                      onFocus={(e) => {
                        e.target.select();
                        setKeyboardActiveInput('phone1')
                      }}
                      value={phone1}
                      maxLength={3}
                      autoComplete='off'
                    />
                    <Text mx={'10px'} fontSize={'28px'}>-</Text>
                    <Input
                      type="number"
                      w={'100px'}
                      letterSpacing={'10px'}
                      onChange={(e) => {
                        console.log('e:', e);
                      }}
                      inputName={'phone2'}
                      onFocus={(e) => {
                        e.target.select();
                        setKeyboardActiveInput('phone2')
                      }}
                      value={phone2}
                      maxLength={4}
                      autoComplete='off'
                    />
                    {/* <PinInput
                      otp
                      onChange={(e) => {
                        setPhone(e);
                      }}
                      name={'pin'}
                      size="lg"
                    >
                      <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                      <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                      <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                      <Text>-</Text>
                      <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                      <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                      <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                      <Text>-</Text>
                      <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                      <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                      <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                      <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                    </PinInput> */}
                  </Center>
                </FormControl>

                <Button
                  variant={'brand'}
                  width={'100%'}
                  type='button'
                  onClick={handleSummonPress}
                >
                  {t('tripWizard.summonShuttle')}
                </Button>
              </VStack>
            </Box>
          </Flex >
        }
        <Flex
          id="vertical-trip-plan"
          flex={1}
          width={'100vw'}
          borderTop="solid thin lightgray"
          borderBottom="solid thin lightgray"
          borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
          // height={ux === 'kiosk' ? `calc(100vh - ${kioskTopHeight + kioskBottomHeight + headerHeight}px)` : '100%'}
          overflow={'hidden'}
        >
          <Flex
            flexDir={'column'}
            borderRight="solid thin lightgray"
            borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
            // w={{ base: '100%', md: '380px' }}
            w={{ base: ux === 'kiosk' ? '380px' : '100%', md: '380px' }}
            h={ux === 'kiosk' ? `calc(100vh - ${kioskTopHeight + kioskBottomHeight + headerHeight}px)` : ''}
            id="vertical-trip-plan-sidebar"
          >
            <Box
              display="flex"
              flexDir={'column'}
              overflow={'auto'}
              flex={1}
              py={2}
              id="vertical-trip-plan-schedule-container"
              tabIndex={0}
            >
              <TripPlanSchedule
                tripPlan={tripPlan}
                tripRequest={tripRequest}
                rider={rider}
              />
              {ux === 'kiosk' && trip.isShuttle &&
                <Box
                  style={{
                    position: 'absolute',
                    top: '35%',
                    width: '380px',
                    padding: '0 15px',
                    textAlign: 'center',
                  }}
                >
                  <Text
                    colorScheme='green'
                    fontSize={'2xl'}
                    style={{
                      fontWeight: 'bold',
                    }}
                  >{shuttleSuccess}</Text>
                  <Text>{timerStarted ? t('tripWizard.timeRemaining', { count: secondsLeft }) : ''}</Text>
                </Box>
              }
            </Box>
            <TripPlanScheduleButtons
              scheduleTripHandler={scheduleTripHandler}
              backClickHandler={backClickHandler}
              cancelClickHandler={cancelClickHandler}
              summonShuttleHandler={handleSummonShuttle}
              scheduleShuttleHandler={scheduleShuttleHandler}            
            />
          </Flex>

          <TripPlanMap tripPlan={tripPlan} flex={1} />
        </Flex>
      </>
    );
  }
);

const TripPlanScheduleButtons = observer(
  ({ scheduleTripHandler, backClickHandler, cancelClickHandler, summonShuttleHandler, scheduleShuttleHandler }) => {
    const { loggedIn } = useStore().authentication;
    const { ux } = useStore().uiStore;
    const { trip } = useStore();
    const { t } = useTranslation();
    return (
      <Stack
        spacing={4}
        alignItems="center"
        py={4}
        px={2}
        id="trip-plan-schedule-buttons"
      >
        {ux === 'callcenter' && (
            <Button
            onClick={scheduleShuttleHandler}
            variant={'brand'}
            isDisabled={!scheduleShuttleHandler}
            width={'100%'}
          >
            {t('tripWizard.scheduleShuttle')}
          </Button>
        )}
        {scheduleTripHandler && (ux === 'webapp') && (
          <Button
            onClick={scheduleTripHandler ? scheduleTripHandler : null}
            variant={'brand'}
            isDisabled={!loggedIn}
            width={'100%'}
          >
            {t('tripWizard.scheduleTrip')}
          </Button>
        )}
        {summonShuttleHandler && trip.isShuttle && ux === 'kiosk' && (
          <Button
            onClick={summonShuttleHandler ? summonShuttleHandler : null}
            variant={'brand'}
            width={'100%'}
          >
            {t('tripWizard.summonShuttle')}
          </Button>
        )}
        {cancelClickHandler && (
          <Button
            width={'100%'}
            variant={'solid'}
            colorScheme="red"
            onClick={cancelClickHandler}
          >
            {t('global.cancel')}
          </Button>
        )}
        <Button width={'100%'} onClick={backClickHandler}>
          {scheduleTripHandler ? t('global.prev') : t('global.close')}
        </Button>
      </Stack>
    );
  }
);
