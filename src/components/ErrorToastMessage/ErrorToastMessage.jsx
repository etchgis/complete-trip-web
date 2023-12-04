import { useColorMode, useToast } from '@chakra-ui/react';

import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useStore } from '../../context/RootStore';

export const ErrorToastMessage = observer(({ message }) => {
  const { errorToastMessage, setErrorToastMessage } = useStore().authentication;
  const {
    toastMessage,
    toastStatus,
    toastTitle,
    setToastMessage,
    setToastStatus,
  } = useStore().uiStore;
  const { colorMode } = useColorMode();

  const toast = useToast();
  const duration = 5000;
  useEffect(() => {
    if (!errorToastMessage && !toastMessage && !message) return;
    const msg = errorToastMessage || toastMessage;
    if (!msg) setToastMessage(message);
    toast({
      title: toastTitle || toastStatus || 'Error',
      description: msg,
      status: toastStatus?.toLowerCase() || 'error',
      duration: duration,
      isClosable: true,
      position: 'top-right',
      variant: 'solid',
    });
    setTimeout(() => {
      setErrorToastMessage(null);
      setToastMessage(null);
      setToastStatus(null);
    }, duration + 1000);
    // eslint-disable-next-line
  }, [errorToastMessage, toastMessage]);
  return <></>;
});
