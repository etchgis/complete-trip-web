import { Button, useDisclosure } from '@chakra-ui/react';
import { useState } from 'react';
import { ConfirmDialogModal } from './ConfirmDialogModal';

export const ConfirmDialog = ({
  confirmFn,
  title,
  buttonText,
  confirmText,
  cancelText,
  verifyText,
  verifyMessage,
  message,
  variant = 'error',
  showIcon = true,
  iconType = 'warning',
  ...rest
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const confirmed = await confirmFn();
      console.log('confirmed', confirmed);
      onClose();
    } catch (error) {
      console.error('Confirmation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        onClick={onOpen}
        {...rest}
      >
        {buttonText || 'Open Confirm Dialog'}
      </Button>

      <ConfirmDialogModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleConfirm}
        title={title || buttonText}
        message={message}
        confirmText={confirmText || buttonText}
        cancelText={cancelText}
        verifyText={verifyText}
        verifyMessage={verifyMessage}
        variant={variant}
        showIcon={showIcon}
        iconType={iconType}
        isLoading={isLoading}
      />
    </>
  );
};
