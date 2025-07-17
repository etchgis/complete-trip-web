import { Box, Button, Flex, Stack, Text, useColorMode, useDisclosure } from '@chakra-ui/react';
import ShuttleSuccessModal from './ShuttleSuccessModal';
import ShuttleSummonModal from './ShuttleSummonModal';

import { TripPlanMap } from './TripPlanMap';
import { TripPlanSchedule } from './TripPlanSchedule';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../context/RootStore';
import useTranslation from '../../models/useTranslation';
import { useEffect, useState } from 'react';
import useIntervalHook from '../../hooks/useIntervalHook';
import { getCurrentKioskConfig } from '../../models/kiosk-definitions';

export const VerticalTripPlan = observer(
  ({
    tripPlan,
    tripRequest,
    rider,
    scheduleTripHandler,
    backClickHandler,
    cancelClickHandler,
    scheduleShuttleHandler,
  }) => {
    const { colorMode } = useColorMode();
    const { trip } = useStore();
    const { ux, setKeyboardType } = useStore().uiStore;
    const { t } = useTranslation();
    const [pin, setPin] = useState('');
    const [areaCode, setAreaCode] = useState('');
    const [phone1, setPhone1] = useState('');
    const [phone2, setPhone2] = useState('');
    const [error, setError] = useState('');
    const [shuttleSuccess, setShuttleSuccess] = useState(false);
    const [showSummon, setShowSummon] = useState(false);
    const [timerStarted, setTimerStarted] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(20);
    const [kioskInfo, setKioskInfo] = useState(null);
    const { isOpen: isSuccessModalOpen, onOpen: openSuccessModal, onClose: closeSuccessModal } = useDisclosure();

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


    // Get kiosk configuration when in kiosk mode
    useEffect(() => {
      if (ux === 'kiosk') {
        const config = getCurrentKioskConfig();
        setKioskInfo(config);
      }
    }, [ux]);

    // Handle successful shuttle summon
    const handleShuttleSummonSuccess = () => {
      setShuttleSuccess(t('tripWizard.popUpSuccess'));
      setPin('');
      setAreaCode('');
      setPhone1('');
      setPhone2('');
      setShowSummon(false);
      setTimerStarted(true);
      openSuccessModal();
    }

    const kioskTopHeight = 700;
    const kioskBottomHeight = 255;
    const headerHeight = 60;

    return (
      <>
        <ShuttleSuccessModal
          isOpen={isSuccessModalOpen}
          onClose={closeSuccessModal}
          successMessage={shuttleSuccess}
          kioskInfo={kioskInfo}
          timerStarted={timerStarted}
          secondsLeft={secondsLeft}
        />

        {ux === 'kiosk' &&
          <ShuttleSummonModal
            isOpen={showSummon}
            onClose={() => setShowSummon(false)}
            onSuccess={handleShuttleSummonSuccess}
            kioskBottomHeight={kioskBottomHeight}
            headerHeight={headerHeight}
            pin={pin}
            setPin={setPin}
            areaCode={areaCode}
            setAreaCode={setAreaCode}
            phone1={phone1}
            setPhone1={setPhone1}
            phone2={phone2}
            setPhone2={setPhone2}
            error={error}
            setError={setError}
          />
        }
        <Flex
          id="vertical-trip-plan"
          flex={1}
          width={'100vw'}
          borderTop="solid thin lightgray"
          borderBottom="solid thin lightgray"
          borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
          overflow={'hidden'}
        >
          <Flex
            flexDir={'column'}
            borderRight="solid thin lightgray"
            borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
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
