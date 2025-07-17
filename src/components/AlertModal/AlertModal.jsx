import { 
  Button, Box, Text, VStack, IconButton
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import { observer } from 'mobx-react-lite';
import useTranslation from '../../models/useTranslation';

/**
 * Minimal alert modal component for user-friendly alerts
 */
const AlertModal = observer(({ 
  isOpen, 
  onClose, 
  message,
  closeButtonText
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
    >
      {/* Modal Backdrop */}
      <Box
        position="fixed"
        top="0"
        left="0"
        width="100%"
        height="100%"
        bg="blackAlpha.600"
        backdropFilter="blur(3px)"
        onClick={onClose}
      />

      {/* Modal Container */}
      <Box
        width="90%"
        maxWidth="400px"
        bg="white"
        borderRadius="lg"
        boxShadow="lg"
        position="relative"
        zIndex={10000}
        overflow="hidden"
      >
        {/* Close button at top-right */}
        <IconButton
          position="absolute"
          top="0.5rem"
          right="0.5rem"
          size="sm"
          variant="ghost"
          icon={<CloseIcon />}
          onClick={onClose}
          aria-label="Close modal"
          zIndex={1}
        />

        {/* Body */}
        <Box padding="2rem 1.5rem">
          <VStack spacing={6} align="center">
            <Text
              fontSize="lg"
              fontWeight="medium"
              textAlign="center"
            >
              {message}
            </Text>
            
            <Button 
              colorScheme="blue" 
              onClick={onClose}
              minWidth="120px"
            >
              {closeButtonText || t('global.close')}
            </Button>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
});

export default AlertModal;
