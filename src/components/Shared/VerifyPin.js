import {
  Center,
  HStack,
  Heading,
  PinInput,
  PinInputField,
  Stack,
  Text,
} from '@chakra-ui/react';

import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useStore } from '../../context/RootStore';

export const VerifyPin = observer(
  ({ channel, stagedUser, setActiveView, setLoginMessage }) => {
    const { user, confirmUser, registerUser, updateUserProfile } =
      useStore().authentication;
    const [verifyError, setVerifyError] = useState(false);
    const to = channel === 'email' ? stagedUser.email : user?.phone;

    return (
      <Stack>
        <Heading as="h2" size="lg" color="brand" fontWeight="400" mb={4}>
          Enter the Verification Code
        </Heading>
        <Text as={'em'}>
          Check <strong>{stagedUser?.email || 'your phone '}</strong> for the
          six-digit verification code and enter it below. You can copy and paste
          the code into the first box.
        </Text>
        <Center flexDirection={'column'}>
          <HStack py={20}>
            <PinInput
              otp
              onChange={() => setVerifyError(false)}
              onComplete={async e => {
                const valid = await confirmUser(to, e);
                if (!valid || valid.error) {
                  setVerifyError(true);
                  return;
                }
                if (channel === 'email') {
                  const newUser = await registerUser(stagedUser);
                  if (!newUser.error) {
                    if (setActiveView) setActiveView('login');
                    if (setLoginMessage)
                      setLoginMessage(
                        'Your account has been created. Please login.'
                      );
                  }
                } else {
                  const profile = Object.assign({}, user?.profile, {
                    onboarded: true,
                  });
                  const updated = await updateUserProfile(profile);
                  if (!updated || updated.error) {
                    return false;
                  }
                  return updated;
                }
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
          {verifyError ? <Text color="red.500">Invalid code.</Text> : ''}
        </Center>
      </Stack>
    );
  }
);
