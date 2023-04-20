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
  useDisclosure,
} from '@chakra-ui/react';

import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useStore } from '../../context/RootStore';

export const MFAVerify = observer(({ buttonText, title, callbackFn }) => {
  const { user, verifyUser, confirmUser } = useStore().authentication;
  const [verifyError, setVerifyError] = useState(false);
  const [stage, setStage] = useState(0);
  const [method, setMethod] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Button onClick={onOpen} colorScheme="blue">
        {buttonText || 'MFA'}
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setStage(0);
          setMethod('');
          onClose();
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
                      <Radio value="sms">Text</Radio>
                      <Radio value="email">Email</Radio>
                      <Radio value="call">Phone Call</Radio>
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
                        onComplete={async e => {
                          const to =
                            method === 'email' ? user?.email : user?.phone;
                          const valid = await confirmUser(to, e);
                          if (!valid || valid.error) {
                            setVerifyError(true);
                            return;
                          }
                          setStage(0);
                          setMethod('');
                          onClose();
                          callbackFn();
                        }}
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
                  </Center>
                </>
              )}
            </>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
});
