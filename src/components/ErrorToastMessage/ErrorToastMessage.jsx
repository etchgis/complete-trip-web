import { useColorMode, useToast } from '@chakra-ui/react';

import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useStore } from '../../context/RootStore';

export const ErrorToastMessage = observer(({ message }) => {
  const { errorToastMessage, setErrorToastMessage } = useStore().authentication;
  const { toastMessage, toastStatus, setToastMessage, setToastStatus } =
    useStore().uiStore;
  const { colorMode } = useColorMode();

  const toast = useToast();

  useEffect(() => {
    if (!errorToastMessage && !toastMessage && !message) return;
    const msg = errorToastMessage || toastMessage;
    if (!msg) setToastMessage(message);
    toast({
      title: toastStatus || 'Error',
      description: msg,
      status: toastStatus?.toLowerCase() || 'error',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
      variant: colorMode === 'light' ? 'top-accent' : 'solid',
    });
    setTimeout(() => {
      setErrorToastMessage(null);
      setToastMessage(null);
      setToastStatus(null);
    }, 30000);
    // eslint-disable-next-line
  }, [errorToastMessage, toastMessage]);
  return <></>;
});
