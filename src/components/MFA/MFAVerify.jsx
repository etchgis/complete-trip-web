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
import useTranslation from '../../models/useTranslation';

export const MFAVerify = observer(
  ({ isOpen, onClose, buttonText, title, callbackFn }) => {
    const {
      contact: user,
      verifyUser,
      confirmUser,
      reset,
    } = useStore().authentication;
    const [verifyError, setVerifyError] = useState(false);
    const [stage, setStage] = useState(0);
    const [method, setMethod] = useState('');
    // console.log({ requireMFA });
    const { t } = useTranslation();
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
    const email = user?.email;
    const phone = user?.phone;
    return (
      <Modal
        isOpen={isOpen}
        onClose={() => {
          console.log(
            '[mfa-verify] resetting auth store via closing MFA modal manually'
          );
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
                  <Text mb={4}>{t('twoFactor.text')}</Text>
                  <RadioGroup
                    onChange={setMethod}
                    value={method}
                    mb={4}
                    defaultChecked={method}
                  >
                    <Stack direction="row">
                      <Radio value="sms">{t('twoFactor.sms')}</Radio>
                      <Radio value="call">{t('twoFactor.call')}</Radio>
                      <Radio value="email">{t('twoFactor.email')}</Radio>
                    </Stack>
                  </RadioGroup>
                  <Button type="submit" variant="brand" mt={4}>
                    {t('twoFactor.send')}
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
                    {t('twoFactor.verifyTitle')}
                  </Heading>
                  {method === 'email' ? (
                    <Text as={'em'}>
                      {t('twoFactor.emailMessage', { email })}
                    </Text>
                  ) : method === 'sms' ? (
                    <Text as={'em'}>
                      {t('twoFactor.smsMessage', { phone })}
                    </Text>
                  ) : (
                    <Text as={'em'}>{t('twoFactor.callMessage')}</Text>
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
                      <Text color="red.500">{t('twoFactor.invalidCode')}</Text>
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
                      color="gray.600"
                    >
                      {t('twoFactor.sendAgain')}
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
