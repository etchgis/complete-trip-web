import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useStore } from '../../context/RootStore';
import { useToast } from '@chakra-ui/react';

export const ErrorToastMessage = observer(({ message }) => {
  const { errorToastMessage, setErrorToastMessage } = useStore().authentication;
  const toast = useToast();

  useEffect(() => {
    if (!errorToastMessage && !message) return;
    console.log({ errorToastMessage });
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
    // eslint-disable-next-line
  }, [errorToastMessage]);
  return <></>;
});
