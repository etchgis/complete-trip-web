import { useDisclosure } from '@chakra-ui/react';
import { useState, useCallback, useRef } from 'react';
import { ConfirmDialogModal } from '../components/ConfirmDialog/ConfirmDialogModal';

export const useConfirmDialog = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [dialogConfig, setDialogConfig] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const promiseRef = useRef(null);

  const confirm = useCallback((config = {}) => {
    setDialogConfig(config);
    onOpen();

    return new Promise((resolve) => {
      promiseRef.current = { resolve };
    });
  }, [onOpen]);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      if (dialogConfig.onConfirm) {
        await dialogConfig.onConfirm();
      }
      promiseRef.current?.resolve(true);
      onClose();
    } catch (error) {
      console.error('Confirmation failed:', error);
      promiseRef.current?.resolve(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    promiseRef.current?.resolve(false);
    onClose();
  };

  const ConfirmDialog = () => (
    <ConfirmDialogModal
      isOpen={isOpen}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      title={dialogConfig.title}
      message={dialogConfig.message}
      confirmText={dialogConfig.confirmText}
      cancelText={dialogConfig.cancelText}
      verifyText={dialogConfig.verifyText}
      verifyMessage={dialogConfig.verifyMessage}
      variant={dialogConfig.variant}
      showIcon={dialogConfig.showIcon}
      iconType={dialogConfig.iconType}
      isLoading={isLoading}
    />
  );

  return { confirm, ConfirmDialog };
};