import {
  Box, Button, Center, Flex, FormControl, FormLabel,
  IconButton, Input, Text, VStack
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../context/RootStore';
import useTranslation from '../../models/useTranslation';
import { useEffect, useRef, useState } from 'react';
import rides from '../../services/transport/rides';
import { getCurrentKioskConfig } from '../../models/kiosk-definitions';
import { checkServiceAvailability } from '../../hooks/useServiceAvailability';
import config from '../../config';

// How long the kiosk waits for the ride request before it stops waiting. The
// request checks the rider's PIN, may book through the organization's booking
// system and then creates the ride, so it is given longer than a read. Past
// this the rider gets the screen back rather than a button that never comes
// out of its loading state.
export const RIDE_REQUEST_TIMEOUT_MS = 20000;

// Thrown when the ride request has not answered in time. It says nothing about
// whether the ride was created, which is the whole problem with it.
const NO_ANSWER = Symbol('ride request did not answer');

// What the rides service says when it refuses a booking. Anything else is
// reported as an unknown failure rather than guessed at.
const requestErrorMessage = (t, e) =>
  e === 'invalid pin' || e === 'user not found for this phone number'
    ? t('tripWizard.popUpError')
    : t('tripWizard.popUpUnknownError');

/**
 * Modal component for summoning a shuttle with PIN and phone verification
 */
const ShuttleSummonModal = observer(({
  isOpen,
  onClose,
  onSuccess,
  kioskBottomHeight = 255,
  headerHeight = 60,
  pin,
  setPin,
  areaCode,
  setAreaCode,
  phone1,
  setPhone1,
  phone2,
  setPhone2,
  error,
  setError,
  // How long to wait for the ride request. A caller only sets this to make a
  // slow booking happen on demand.
  requestTimeoutMs = RIDE_REQUEST_TIMEOUT_MS
}) => {
  const { ux, activeInput, setKeyboardActiveInput, getKeyboardInputValue, onScreenKeyboardInput, setKeyboardType } = useStore().uiStore;
  const { trip } = useStore();
  const { t } = useTranslation();
  
  const pinInputRef = useRef(null);
  const areaCodeRef = useRef(null);
  const phone1Ref = useRef(null);
  const phone2Ref = useRef(null);
  // Set from the first tap on Summon Shuttle until the request is done, so more
  // taps while it is out cannot send a second shuttle.
  const [summoning, setSummoning] = useState(false);
  const summoningRef = useRef(false);
  // The phone number of a ride request that stopped answering. The server may
  // have created that ride, so the rider is told before the button will book
  // another one.
  const [unconfirmed, setUnconfirmed] = useState(null);
  // A new number every time the form opens. It stands for the rider at the
  // kiosk right now. A ride request captures the value at the tap and a late
  // reply only acts on the form when the number still matches, so an earlier
  // rider's reply cannot touch a later rider's session.
  const sessionRef = useRef(0);

  useEffect(() => {
    if (ux !== 'kiosk' || !isOpen) return;

    // Update local state based on keyboard input changes
    const pinValue = getKeyboardInputValue('pin');
    const areaCodeValue = getKeyboardInputValue('areaCode');
    const phone1Value = getKeyboardInputValue('phone1');
    const phone2Value = getKeyboardInputValue('phone2');

    // Update all fields with their current values
    setPin(pinValue || '');
    setAreaCode(areaCodeValue || '');
    setPhone1(phone1Value || '');
    setPhone2(phone2Value || '');

  }, [onScreenKeyboardInput, ux, isOpen]);
  
  // Listen for active input changes and focus the appropriate field
  useEffect(() => {
    if (ux !== 'kiosk' || !isOpen) return;
    
    // Focus the appropriate field based on the active input
    setTimeout(() => {
      if (activeInput === 'pin' && pinInputRef.current) {
        pinInputRef.current.focus();
      } else if (activeInput === 'areaCode' && areaCodeRef.current) {
        areaCodeRef.current.focus();
      } else if (activeInput === 'phone1' && phone1Ref.current) {
        phone1Ref.current.focus();
      } else if (activeInput === 'phone2' && phone2Ref.current) {
        phone2Ref.current.focus();
      }
    }, 50);
  }, [activeInput, ux, isOpen]);

  const handleOpen = () => {
    // A fresh session for the rider now opening the form.
    sessionRef.current += 1;

    // Clear fields and set PIN as the active input when modal opens
    setPin('');
    setAreaCode('');
    setPhone1('');
    setPhone2('');
    // The button label and this warning both come from the unconfirmed state,
    // so they are shown or hidden together. Reopening keeps the warning while
    // that state stands, so the "Try again anyway" button always has its
    // "we couldn't confirm your ride" explanation beside it.
    setError(unconfirmed ? t('tripWizard.rideUnconfirmed') : '');
    setKeyboardActiveInput('pin');

    // TODO: make the keyboard type dynamic based on the input
    setKeyboardType('numeric');

    if (pinInputRef.current) {
      // Focus the PIN field after a brief delay to ensure the modal is fully rendered
      // The modal can close before this runs, which removes the field.
      setTimeout(() => {
        pinInputRef.current?.focus();
      }, 200);
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleOpen();
    }
  }, [isOpen]);

  const handleSummonPress = async () => {
    if (summoningRef.current) return;
    if (pin.length !== 4 || areaCode.length !== 3 || phone1.length !== 3 || phone2.length !== 4) {
      setError(t('tripWizard.popUpError'));
      return;
    }
    const phone = `+1${areaCode}${phone1}${phone2}`;

    summoningRef.current = true;
    setSummoning(true);
    setError('');
    try {
      // This creates a ride for right now, and the rider may have spent minutes
      // on the destination, PIN and phone since tapping the shuttle, so the
      // shuttle is checked again here. Only a check that says it is running
      // lets the ride through. A failed or slow check, or a service with no
      // hours on record, is refused as unconfirmed rather than as closed.
      const verdict = await checkServiceAvailability(config.HDS_SERVICE_ID);
      if (verdict !== 'available') {
        setError(
          t(
            verdict === 'unavailable'
              ? 'routeList.shuttleNotAvailableTimeFrame'
              : 'tripWizard.shuttleUnconfirmed'
          )
        );
        return;
      }

      const organizationId = '3738f2ea-ddc0-4d86-9a8a-4f2ed531a486',
        driverId = null,
        datetime = Date.now(),
        passengers = 1;

      const kioskConfig = getCurrentKioskConfig();
      const pickup = {
        title: kioskConfig?.displayName || 'Kiosk Location',
        address: kioskConfig?.pickupAddress || '',
        coordinates: kioskConfig?.pickupPoint ?
          [kioskConfig.pickupPoint.lng, kioskConfig.pickupPoint.lat] :
          [kioskConfig?.location.lng, kioskConfig?.location.lat],
      };
      const dropoff = {
        title: trip.request.destination.title,
        address: trip.request.destination.address,
        coordinates: [
          trip.request.destination.point.lng,
          trip.request.destination.point.lat
        ]
      };
      let timedOut = false;
      let timer;
      // The session that owns this request. If the form is closed and reopened
      // the session changes, and any reply to this request is then ignored.
      const session = sessionRef.current;
      const requested = rides.request(
        organizationId,
        datetime,
        'leave',
        pickup,
        dropoff,
        driverId,
        passengers,
        phone,
        pin
      );

      // The reply can still arrive after we have stopped waiting for it, and
      // it is the only thing that can say what became of the ride. A late
      // success is the rider's ride, so it is shown as one; a late failure
      // means no ride was created and the warning can go.
      requested.then(
        result => {
          if (!timedOut || sessionRef.current !== session) return;
          console.log('SUMMONED RESULT (late):', result);
          setUnconfirmed(null);
          setError('');
          onSuccess();
        },
        e => {
          if (!timedOut || sessionRef.current !== session) return;
          setUnconfirmed(null);
          setError(requestErrorMessage(t, e));
        }
      );

      try {
        const result = await Promise.race([
          requested,
          new Promise((resolve, reject) => {
            timer = setTimeout(() => reject(NO_ANSWER), requestTimeoutMs);
          }),
        ]);
        if (sessionRef.current !== session) return;
        console.log('SUMMONED RESULT:', result);
        setUnconfirmed(null);
        onSuccess();
      } catch (e) {
        if (sessionRef.current !== session) return;
        if (e === NO_ANSWER) {
          // The request may have created the ride before the reply was lost.
          // Booking again without saying so would put the rider in two rides.
          timedOut = true;
          setUnconfirmed(phone);
          setError(t('tripWizard.rideUnconfirmed'));
        }
        else {
          setUnconfirmed(null);
          setError(requestErrorMessage(t, e));
        }
      } finally {
        clearTimeout(timer);
      }
    } finally {
      summoningRef.current = false;
      setSummoning(false);
    }
  };

  // The warning belongs to the number that was booked with. It stays through a
  // close and reopen, which clears the fields, and only goes once another
  // whole number has been typed in.
  useEffect(() => {
    const typed = `+1${areaCode}${phone1}${phone2}`;
    if (unconfirmed && typed.length === 12 && typed !== unconfirmed) {
      setUnconfirmed(null);
    }
  }, [unconfirmed, areaCode, phone1, phone2]);

  // Reset keyboard type to default when modal is closed
  useEffect(() => {
    if (!isOpen && ux === 'kiosk') {
      setKeyboardType('default');
    }
  }, [isOpen, ux]);

  // Create a focus trap to prevent tabbing outside the modal
  useEffect(() => {
    if (!isOpen || ux !== 'kiosk') return;

    // Handler for keyboard events to trap focus
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault(); // Prevent default tab behavior

        // Define the focusable elements
        const focusableElements = [
          pinInputRef.current,
          areaCodeRef.current,
          phone1Ref.current,
          phone2Ref.current
        ].filter(Boolean);

        // Add the submit button to focusable elements
        const submitButton = document.querySelector('[data-test-id="summon-shuttle-button"]');
        if (submitButton) {
          focusableElements.push(submitButton);
        }

        // Add the close button to focusable elements
        const closeButton = document.querySelector('[data-test-id="shuttle-modal-close"]');
        if (closeButton) {
          focusableElements.push(closeButton);
        }

        if (focusableElements.length === 0) return;

        // Find the current focus index
        const currentIndex = focusableElements.indexOf(document.activeElement);

        // Calculate the next index based on shift key
        let nextIndex;
        if (e.shiftKey) {
          // If shift+tab, go to previous element or wrap to last
          nextIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
        } else {
          // If tab, go to next element or wrap to first
          nextIndex = (currentIndex >= focusableElements.length - 1) ? 0 : currentIndex + 1;
        }

        // Focus the next element
        focusableElements[nextIndex].focus();
      }
    };

    // Add event listener for key presses
    document.addEventListener('keydown', handleKeyDown);

    // Clean up
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, ux]);

  if (!isOpen) return null;

  return (
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
        onClick={onClose}
        aria-label={t('global.close')}
        icon={<CloseIcon />}
        pos={'absolute'}
        top={4}
        right={4}
        variant={'ghost'}
        data-test-id="shuttle-modal-close"
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
                type="password"
                w={'100px'}
                letterSpacing={'10px'}
                name="pin"
                inputName="pin"
                ref={pinInputRef}
                onFocus={() => {
                  setKeyboardActiveInput('pin');
                }}
                value={pin}
                maxLength={4}
                autoComplete='off'
              />
            </Center>
          </FormControl>

          <FormControl mb={'40px'}>
            <FormLabel textAlign={'center'}>{t('tripWizard.popUpPhone')}</FormLabel>
            <Center w={'100%'}>
              <Input
                type="number"
                w={'82px'}
                letterSpacing={'10px'}
                name="areaCode"
                inputName="areaCode"
                ref={areaCodeRef}
                onFocus={() => {
                  setKeyboardActiveInput('areaCode');
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
                name="phone1"
                inputName="phone1"
                ref={phone1Ref}
                onFocus={() => {
                  setKeyboardActiveInput('phone1');
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
                name="phone2"
                inputName="phone2"
                ref={phone2Ref}
                onFocus={() => {
                  setKeyboardActiveInput('phone2');
                }}
                value={phone2}
                maxLength={4}
                autoComplete='off'
              />
            </Center>
          </FormControl>

          <Button
            variant={'brand'}
            width={'100%'}
            type='button'
            onClick={handleSummonPress}
            isLoading={summoning}
            data-test-id="summon-shuttle-button"
          >
            {t(
              unconfirmed
                ? 'tripWizard.summonShuttleRetry'
                : 'tripWizard.summonShuttle'
            )}
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
});

export default ShuttleSummonModal;