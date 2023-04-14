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
  useDisclosure,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';

export const ConfirmDialog = ({
  confirmFn,
  buttonText,
  confirmText,
  verifyText,
  verifyMessage,
  message,
  ...rest
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const [text, setText] = useState('');

  const confirmFunction = async () => {
    if (verifyText) {
      if (text.toLowerCase() !== verifyText.toLowerCase()) {
        return;
      }
    }
    const confirmed = await confirmFn();
    console.log('confirmed', confirmed);
    onClose();
  };

  return (
    <>
      <Button
        colorScheme="red"
        onClick={() => {
          setText('');
          onOpen();
        }}
        {...rest}
      >
        {buttonText || 'Confirm Button'}
      </Button>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="red.500">
              {buttonText}
            </AlertDialogHeader>

            <AlertDialogBody>
              {message || 'Confirm  Message'}
              {verifyText ? (
                <>
                  <Text fontWeight="bold" my={4}>
                    {verifyMessage || 'Verify Message'}
                  </Text>
                  <Input value={text} onChange={e => setText(e.target.value)} />
                </>
              ) : null}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmFunction}
                ml={3}
                isDisabled={
                  !verifyText
                    ? false
                    : verifyText &&
                      text.toLowerCase() !== verifyText?.toLowerCase()
                    ? true
                    : false
                }
              >
                {confirmText || buttonText || 'Confirm Text'}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};
