import { Box, Button, Center, Flex, FormControl, FormLabel, IconButton, PinInput, PinInputField, Stack, Text, VStack, useColorMode } from '@chakra-ui/react';

import { TripPlanMap } from './TripPlanMap';
import { TripPlanSchedule } from './TripPlanSchedule';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { useStore } from '../../context/RootStore';
import useTranslation from '../../models/useTranslation';
import { useEffect, useRef, useState } from 'react';
import { CloseIcon } from '@chakra-ui/icons';
import rides from '../../services/transport/rides';
import { result } from 'lodash';
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
  }) => {
    const { colorMode } = useColorMode();
    const { trip } = useStore();
    const { ux } = useStore().uiStore;
    const { t } = useTranslation();
    const [pin, setPin] = useState('');
    const [phone, setPhone] = useState('');
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

    const handleSummonPress = () => {
      if (pin.length !== 4 || phone.length !== 10) {
        setError(t('tripWizard.popUpError'));
      }
      else {
        const organizationId = '3738f2ea-ddc0-4d86-9a8a-4f2ed531a486',
          driverId = 'd95c52b6-ee0d-44f1-9148-7c77971a4653',
          datetime = Date.now(),
          passengers = 1;
        rides.request(
          organizationId,
          datetime,
          'leave',
          trip.request.origin,
          trip.request.destination,
          driverId,
          passengers,
          `+1${phone}`,
          pin
        )
          .then((result) => {
            console.log('SUMMONED RESULT:', result);
            setShuttleSuccess(t('tripWizard.popUpSuccess'));
            setPin('');
            setPhone('');
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

    return (
      <>
        {ux === 'kiosk' && showSummon &&
          <Flex
            background={'white'}
            position={'absolute'}
            zIndex={3}
            top="50%"
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
                    <PinInput
                      otp
                      onChange={(e) => {
                        setPin(e);
                      }}
                      name={'pin'}
                      size="lg"
                    >
                      <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                      <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                      <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                      <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                    </PinInput>
                  </Center>
                </FormControl>

                <FormControl mb={'40px'}>
                  <FormLabel textAlign={'center'}>{t('tripWizard.popUpPhone')}</FormLabel>
                  <Center w={'100%'}>
                    <PinInput
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
                    </PinInput>
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
          height={'100%'}
          overflow={'hidden'}
        >
          <Flex
            flexDir={'column'}
            borderRight="solid thin lightgray"
            borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
            // w={{ base: '100%', md: '380px' }}
            w={{ base: ux === 'kiosk' ? '380px' : '100%', md: '380px' }}
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
            />
          </Flex>

          <TripPlanMap tripPlan={tripPlan} flex={1} />
        </Flex>
      </>
    );
  }
);

const TripPlanScheduleButtons = observer(
  ({ scheduleTripHandler, backClickHandler, cancelClickHandler, summonShuttleHandler }) => {
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
        {scheduleTripHandler && ux === 'webapp' && (
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
