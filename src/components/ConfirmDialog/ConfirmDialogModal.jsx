import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Input,
  Text,
  Box,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { WarningIcon, InfoIcon, CheckCircleIcon } from '@chakra-ui/icons';
import useTranslation from '../../models/useTranslation';

const iconMap = {
  warning: WarningIcon,
  error: WarningIcon,
  info: InfoIcon,
  success: CheckCircleIcon,
};

const iconColors = {
  warning: 'orange.500',
  error: 'red.500',
  info: 'blue.500',
  success: 'green.500',
};

export const ConfirmDialogModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  verifyText,
  verifyMessage,
  variant = 'error',
  showIcon = true,
  iconType = 'warning',
  isLoading = false,
}) => {
  const cancelRef = useRef();
  const [text, setText] = useState('');
  const { t } = useTranslation();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const overlayBg = useColorModeValue('blackAlpha.600', 'blackAlpha.700');
  const headerBg = useColorModeValue('gray.50', 'gray.700');

  const IconComponent = iconMap[iconType] || WarningIcon;

  const handleConfirm = () => {
    if (verifyText && text.toLowerCase() !== verifyText.toLowerCase()) {
      return;
    }
    onConfirm();
  };

  const handleClose = () => {
    setText('');
    onClose();
  };

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={handleClose}
      motionPreset="slideInBottom"
      isCentered
    >
      <AlertDialogOverlay bg={overlayBg} backdropFilter="blur(4px)">
        <AlertDialogContent
          bg={bgColor}
          borderRadius="lg"
          boxShadow="2xl"
          border="1px solid"
          borderColor={borderColor}
          overflow="hidden"
          maxW="md"
        >
          <AlertDialogHeader
            fontSize="xl"
            fontWeight="bold"
            bg={headerBg}
            display="flex"
            alignItems="center"
            gap={3}
            py={4}
          >
            {showIcon && (
              <Icon
                as={IconComponent}
                color={iconColors[iconType]}
                boxSize={6}
              />
            )}
            <Text>{title || 'Confirmation Required'}</Text>
          </AlertDialogHeader>

          <AlertDialogBody tabIndex={0} py={6}>
            <Text fontSize="md" color={useColorModeValue('gray.700', 'gray.300')}>
              {message || 'Are you sure you want to proceed with this action?'}
            </Text>
            {verifyText ? (
              <Box mt={6}>
                <Text fontWeight="bold" mb={3} fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                  {verifyMessage || `Please type "${verifyText}" to confirm`}
                </Text>
                <Input
                  value={text}
                  placeholder={verifyText}
                  onChange={e => setText(e.target.value)}
                  borderColor={
                    text && text.toLowerCase() !== verifyText.toLowerCase()
                      ? 'red.300'
                      : text.toLowerCase() === verifyText.toLowerCase()
                      ? 'green.300'
                      : 'gray.300'
                  }
                  focusBorderColor={
                    text.toLowerCase() === verifyText.toLowerCase()
                      ? 'green.500'
                      : 'blue.500'
                  }
                  _hover={{
                    borderColor: text && text.toLowerCase() !== verifyText.toLowerCase()
                      ? 'red.400'
                      : 'gray.400',
                  }}
                />
              </Box>
            ) : null}
          </AlertDialogBody>

          <AlertDialogFooter bg={headerBg} gap={3}>
            <Button
              ref={cancelRef}
              onClick={handleClose}
              variant="ghost"
              _hover={{ bg: useColorModeValue('gray.100', 'gray.600') }}
            >
              {cancelText || t('global.cancel')}
            </Button>
            <Button
              variant={variant}
              onClick={handleConfirm}
              isLoading={isLoading}
              loadingText="Processing..."
              isDisabled={
                verifyText && text.toLowerCase() !== verifyText?.toLowerCase()
              }
              _hover={{
                transform: 'translateY(-1px)',
                boxShadow: 'lg',
              }}
              transition="all 0.2s"
            >
              {confirmText || 'Confirm'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};