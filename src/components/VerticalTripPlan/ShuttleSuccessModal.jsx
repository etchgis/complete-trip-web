import { 
  Button, Box, Text, VStack, Flex, Heading, IconButton
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { observer } from 'mobx-react-lite';
import useTranslation from '../../models/useTranslation';

/**
 * Modal component that displays shuttle success information with kiosk-specific directions
 */
const ShuttleSuccessModal = observer(({ 
  isOpen, 
  onClose, 
  successMessage, 
  kioskInfo, 
  timerStarted, 
  secondsLeft 
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      width="100vw"
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex={9999}
      paddingTop="10vh"
    >
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
        width="90%"
        maxWidth="500px"
        bg="white"
        borderRadius="md"
        boxShadow="xl"
        position="relative"
        zIndex={10000}
        overflow="hidden"
      >
        {/* Header */}
        <Flex 
          padding="1rem" 
          borderBottomWidth="1px" 
          borderBottomColor="gray.200"
          alignItems="center"
          justifyContent="space-between"
        >
          <Heading size="md">{t('tripWizard.popUpSuccessModalTitle')}</Heading>
          <IconButton
            size="sm"
            variant="ghost"
            icon={<CloseIcon />}
            onClick={onClose}
            aria-label="Close modal"
          />
        </Flex>

        {/* Body */}
        <Box padding="1.5rem">
          <VStack spacing={4} align="center">
            <Text
              color="green.600"
              fontSize="xl"
              fontWeight="bold"
              textAlign="center"
            >
              {successMessage}
            </Text>

            {kioskInfo && (
              <VStack spacing={4} align="center" padding="15px" border="1px solid #e2e8f0" borderRadius="md" background="#f8f9fa" width="100%">
                <Text
                  fontSize="lg"
                  fontWeight="bold"
                >{t('tripWizard.popUpDirectionsTitle')}</Text>
                
                <Text textAlign="center">{kioskInfo.kioskDirections && kioskInfo.kioskDirections[t.language || 'en']}</Text>
                
                {kioskInfo.pickupImagePath && (
                  <>
                    <Text fontSize="md" mb={1}>{t('tripWizard.popUpDirectionsImage')}</Text>
                    <Box
                      width="90%"
                      height="200px"
                      backgroundImage={`url(${kioskInfo.pickupImagePath})`}
                      backgroundSize="cover"
                      backgroundPosition="center"
                      borderRadius="md"
                    />
                  </>
                )}
              </VStack>
            )}

            <Text fontSize="lg" fontWeight="bold" mt={4}>
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
          <Button colorScheme="blue" onClick={onClose}>
            {t('global.close')}
          </Button>
        </Flex>
      </Box>
    </Box>
  );
});

export default ShuttleSuccessModal;
