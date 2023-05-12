import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useStore } from '../../context/RootStore';
import { useToast } from '@chakra-ui/react';

export const ErrorToastMessage = observer(({ message }) => {
  const { errorToastMessage, setErrorToastMessage } = useStore().authentication;
  const { toastMessage, toastStatus, setToastMessage, setToastStatus } = useStore().uiStore;

  const toast = useToast();

  useEffect(() => {
    if (!errorToastMessage && !toastMessage && !message) return;
    const msg = message || errorToastMessage || toastMessage;
    toast({
      title: toastStatus || 'Error',
      description: msg,
      status: toastStatus?.toLowerCase() || 'error',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
      variant: 'top-accent',
    });
    setTimeout(() => {
      setErrorToastMessage(null);
      setToastMessage(null);
      setToastStatus(null);
    }, 4000);
    // eslint-disable-next-line
  }, [errorToastMessage, toastMessage]);
  return <></>;
});
