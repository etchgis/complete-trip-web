import { 
  Button, Box, Text, VStack, Flex, Heading, IconButton
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { observer } from 'mobx-react-lite';
import DemoBanner, { DEMO_BANNER_HEIGHT } from './DemoBanner';
import { isWalkUpDemoActive } from '../../models/kiosk-walkup';
import useTranslation from '../../models/useTranslation';
import { TABLET_SCREEN_HEIGHT, isTabletKiosk } from '../../models/kiosk-layout';
import { getSizes } from './walkUpLayout';

// Space between the top of the screen (or the demo banner) and the box on the large screen.
const LARGE_TOP_GAP = 24;

/**
 * Modal component that displays shuttle success information with kiosk-specific directions
 */
const ShuttleSuccessModal = observer(({ 
  isOpen, 
  onClose, 
  successMessage, 
  kioskInfo, 
  timerStarted, 
  secondsLeft,
  // Optional extra sentences shown under the success message.
  extraLines = []
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  // Bigger text and buttons on the shared tablet and the large shared screen.
  const sz = getSizes();
  // On the large screen the box stays above the 255 pixel on-screen keyboard.
  const bigLarge = sz.big && !isTabletKiosk;
  const bannerHeight = isWalkUpDemoActive() ? DEMO_BANNER_HEIGHT : 0;

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      width="100vw"
      height={isTabletKiosk ? TABLET_SCREEN_HEIGHT : '100vh'}
      display="flex"
      alignItems={bigLarge ? 'flex-start' : 'center'}
      justifyContent="center"
      zIndex={9999}
      paddingTop={bigLarge ? `${LARGE_TOP_GAP + bannerHeight}px` : isTabletKiosk ? (isWalkUpDemoActive() ? '56px' : 0) : '10vh'}
    >
      <DemoBanner />
      {/* Modal Backdrop */}
      <Box
        position="fixed"
        top="0"
        left="0"
        width="100%"
        height="100%"
        bg="blackAlpha.600"
        backdropFilter="blur(5px)"
        onClick={onClose}
      />

      {/* Modal Container */}
      <Box
        width={sz.big ? '92%' : '90%'}
        maxWidth={sz.big ? sz.maxW : '500px'}
        bg="white"
        borderRadius="md"
        boxShadow="xl"
        position="relative"
        zIndex={10000}
        overflow={isTabletKiosk ? 'auto' : 'hidden'}
        maxH={isTabletKiosk ? `calc(${TABLET_SCREEN_HEIGHT} - ${isWalkUpDemoActive() ? 72 : 16}px)` : bigLarge ? `calc(100vh - ${LARGE_TOP_GAP + bannerHeight + 255 + 16}px)` : undefined}
        overflowY={bigLarge ? 'auto' : undefined}
      >
        {/* Header */}
        <Flex 
          padding="1rem" 
          borderBottomWidth="1px" 
          borderBottomColor="gray.200"
          alignItems="center"
          justifyContent="space-between"
        >
          <Heading size="md" fontSize={sz.big ? sz.label : undefined}>{t('tripWizard.popUpSuccessModalTitle')}</Heading>
          <IconButton
            size={sz.big ? 'lg' : 'sm'}
            minW={sz.big ? sz.close : undefined}
            minH={sz.big ? sz.close : undefined}
            fontSize={sz.big ? '28px' : undefined}
            variant="ghost"
            icon={<CloseIcon />}
            onClick={onClose}
            aria-label="Close modal"
          />
        </Flex>

        {/* Body */}
        <Box padding={sz.big ? '1.5rem' : isTabletKiosk ? '1rem' : '1.5rem'}>
          <VStack spacing={sz.big ? 6 : 4} align="center">
            <Text
              color="green.600"
              fontSize={sz.big ? sz.title : 'xl'}
              lineHeight={sz.big ? 1.2 : undefined}
              fontWeight="bold"
              textAlign="center"
            >
              {successMessage}
            </Text>

            {extraLines.map(line => (
              <Text key={line} fontSize={sz.big ? sz.body : 'lg'} textAlign="center">{line}</Text>
            ))}

            {kioskInfo && (
              <VStack spacing={sz.big ? 5 : 4} align="center" padding={sz.big ? '24px' : '15px'} border="1px solid #e2e8f0" borderRadius="md" background="#f8f9fa" width="100%">
                <Text
                  fontSize={sz.big ? sz.body : 'lg'}
                  fontWeight="bold"
                >{t('tripWizard.popUpDirectionsTitle')}</Text>
                
                <Text textAlign="center" fontSize={sz.big ? sz.body : undefined}>{kioskInfo.kioskDirections && kioskInfo.kioskDirections[t.language || 'en']}</Text>
                
                {kioskInfo.pickupImagePath && (
                  <>
                    <Text fontSize={sz.big ? sz.hint : 'md'} mb={1}>{t('tripWizard.popUpDirectionsImage')}</Text>
                    <Box
                      width="90%"
                      height={sz.big ? sz.imageH : '200px'}
                      backgroundImage={`url(${kioskInfo.pickupImagePath})`}
                      backgroundSize="cover"
                      backgroundPosition="center"
                      borderRadius="md"
                    />
                  </>
                )}
              </VStack>
            )}

            <Text fontSize={sz.big ? sz.body : 'lg'} fontWeight="bold" mt={4}>
              {timerStarted ? t('tripWizard.timeRemaining', { count: secondsLeft }) : ''}
            </Text>
          </VStack>
        </Box>

        {/* Footer */}
        <Flex 
          padding="1rem" 
          borderTopWidth="1px" 
          borderTopColor="gray.200"
          justifyContent="flex-end"
        >
          <Button colorScheme="blue" onClick={onClose} minH={sz.big ? sz.buttonH : isTabletKiosk ? '56px' : undefined} fontSize={sz.big ? sz.button : isTabletKiosk ? '20px' : undefined} px={sz.big ? 12 : undefined}>
            {t('global.close')}
          </Button>
        </Flex>
      </Box>
    </Box>
  );
});

export default ShuttleSuccessModal;
