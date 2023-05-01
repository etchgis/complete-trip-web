import {
  Box,
  Button,
  Center,
  HStack,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  PinInput,
  PinInputField,
  Radio,
  RadioGroup,
  Stack,
  Text,
} from '@chakra-ui/react';

import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useStore } from '../../context/RootStore';

export const MFAVerify = observer(
  ({ isOpen, onClose, buttonText, title, callbackFn }) => {
    const { contact: user, verifyUser, confirmUser, reset } = useStore().authentication;
    const [verifyError, setVerifyError] = useState(false);
    const [stage, setStage] = useState(0);
    const [method, setMethod] = useState('');
    // console.log({ requireMFA });

    const onComplete = async e => {
      const to = method === 'email' ? user?.email : user?.phone;
      const valid = await confirmUser(to, e);
      if (!valid || valid.error) {
        setVerifyError(true);
        return;
      }
      setStage(0);
      setMethod('');
      onClose();
      callbackFn();
    };

    return (
      <Modal
        isOpen={isOpen}
        onClose={() => {
          reset();
          setStage(0);
          setMethod('');
        }}
        size={'md'}
        scrollBehavior={'inside'}
      >
        <ModalOverlay />
        <ModalContent>
          {title ? <ModalHeader>{title}</ModalHeader> : ''}
          <ModalCloseButton />
          <ModalBody p={8} id="modal--body" borderRadius={'10px'}>
            <>
              {stage === 0 ? (
                <Box
                  as="form"
                  onSubmit={async e => {
                    e.preventDefault();
                    const to = method === 'email' ? user?.email : user?.phone;
                    await verifyUser(method, to);
                    setStage(1);
                  }}
                >
                  <Text mb={4}>
                    To proceed please choose a method for receiving an
                    authentication code.
                  </Text>
                  <RadioGroup
                    onChange={setMethod}
                    value={method}
                    mb={4}
                    defaultChecked={method}
                  >
                    <Stack direction="row">
                      <Radio value="sms">Text Me</Radio>
                      <Radio value="call">Call Me</Radio>
                      <Radio value="email">Email Me</Radio>
                    </Stack>
                  </RadioGroup>
                  <Button type="submit" colorScheme="blue" mt={4}>
                    Send Authentication Code
                  </Button>
                </Box>
              ) : (
                <>
                  <Heading
                    as="h2"
                    size="lg"
                    color="brand"
                    fontWeight="400"
                    mb={4}
                  >
                    Enter the Verification Code
                  </Heading>
                  {method === 'email' ? (
                    <Text as={'em'}>
                      Check <strong>{user?.email}</strong> for the six-digit
                      verification code and enter it below. You can copy and
                      paste the code into the first box.
                    </Text>
                  ) : method === 'sms' ? (
                    <Text as={'em'}>
                      Check <strong>{user?.phone}</strong> for the six-digit
                      verification code and enter it below. You can copy and
                      paste the code into the first box.
                    </Text>
                  ) : (
                    <Text as={'em'}>
                      Wait for the phone call then type the six digit code into
                      the box below.
                    </Text>
                  )}

                  <Center flexDirection={'column'}>
                    <HStack py={20}>
                      <PinInput
                        otp
                        onChange={() => setVerifyError(false)}
                        onComplete={onComplete}
                        size="lg"
                      >
                        <PinInputField />
                        <PinInputField />
                        <PinInputField />
                        <PinInputField />
                        <PinInputField />
                        <PinInputField />
                      </PinInput>
                    </HStack>
                    {verifyError ? (
                      <Text color="red.500">Invalid code.</Text>
                    ) : (
                      ''
                    )}
                    <Button
                      onClick={async () => {
                        const to =
                          method === 'email' ? user?.email : user?.phone;
                        await verifyUser(method, to);
                      }}
                      variant={'link'}
                    >
                      Send Another Code?
                    </Button>
                  </Center>
                </>
              )}
            </>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
);
