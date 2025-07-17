import {
  Box, Button, Center, Flex, FormControl, FormLabel,
  IconButton, Input, Text, VStack
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../context/RootStore';
import useTranslation from '../../models/useTranslation';
import { useEffect, useRef } from 'react';
import rides from '../../services/transport/rides';
import { getCurrentKioskConfig } from '../../models/kiosk-definitions';

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
  setError
}) => {
  const { ux, activeInput, setKeyboardActiveInput, getKeyboardInputValue, onScreenKeyboardInput, setKeyboardType } = useStore().uiStore;
  const { trip } = useStore();
  const { t } = useTranslation();
  
  const pinInputRef = useRef(null);
  const areaCodeRef = useRef(null);
  const phone1Ref = useRef(null);
  const phone2Ref = useRef(null);

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
    // Clear fields and set PIN as the active input when modal opens
    setPin('');
    setAreaCode('');
    setPhone1('');
    setPhone2('');
    setError('');
    setKeyboardActiveInput('pin');

    // TODO: make the keyboard type dynamic based on the input
    setKeyboardType('numeric');

    if (pinInputRef.current) {
      // Focus the PIN field after a brief delay to ensure the modal is fully rendered
      setTimeout(() => {
        pinInputRef.current.focus();
      }, 200);
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleOpen();
    }
  }, [isOpen]);

  const handleSummonPress = () => {
    if (pin.length !== 4 || areaCode.length !== 3 || phone1.length !== 3 || phone2.length !== 4) {
      setError(t('tripWizard.popUpError'));
    }
    else {
      setError('');
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
          onSuccess();
        })
        .catch((e) => {
          if (e === 'invalid pin' || e === 'user not found for this phone number') {
            setError(t('tripWizard.popUpError'));
          }
          else {
            setError(t('tripWizard.popUpUnknownError'));
          }
        });
    }
  };

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
            data-test-id="summon-shuttle-button"
          >
            {t('tripWizard.summonShuttle')}
          </Button>
        </VStack>
      </Box>
    </Flex>
  );
});

export default ShuttleSummonModal;