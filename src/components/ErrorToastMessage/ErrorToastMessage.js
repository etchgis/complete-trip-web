import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useStore } from '../../context/mobx/RootStore';
import { useToast } from '@chakra-ui/react';

export const ErrorToastMessage = observer(({ message }) => {
  const { errorToastMessage, setErrorToastMessage } = useStore().authentication;
  const toast = useToast();

  useEffect(() => {
    console.log({ errorToastMessage });
    if (!errorToastMessage && !message) return;
    toast({
      title: 'Error',
      description: message || errorToastMessage || '',
      status: 'error',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
      variant: 'top-accent',
    });
    setTimeout(() => {
      setErrorToastMessage(null);
    }, 4000);
  }, [errorToastMessage]);
  return <></>;
});
