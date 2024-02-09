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
import { toJS } from 'mobx';
import { useState } from 'react';
import { useStore } from '../../context/RootStore';
import useTranslation from '../../models/useTranslation';

export const VerifyPin = observer(
  ({ channel, stagedUser, setActiveView, setLoginMessage }) => {
    const { user, confirmUser, registerUser, updateUserProfile } =
      useStore().authentication;
    const { stagedCaregiver, invite: inviteCaregiver } = useStore().caregivers;

    const [verifyError, setVerifyError] = useState(false);
    const to = channel === 'email' ? stagedUser.email : user?.phone;
    const { t } = useTranslation();
    return (
      <Stack>
        <Heading as="h2" size="lg" color="brand" fontWeight="400" mb={4}>
          {t('twoFactor.verifyTitle')}
        </Heading>
        {/* TODO add back in email of staged user */}
        <Text as={'em'}>{t('twoFactor.emailMessage', { email: to })}</Text>
        <Center flexDirection={'column'}>
          <HStack py={20}>
            {/* TODO move this somewhere else so this can be a generic component */}
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
                  try {
                    const newUser = await registerUser(stagedUser);
                    console.log({ newUser });
                    if (setActiveView) setActiveView('login');
                    if (setLoginMessage)
                      setLoginMessage(t('loginWizard.accountCreated'));
                  } catch (error) {
                    setActiveView('login');
                  }
                } else {
                  const profile = Object.assign({}, toJS(user?.profile), {
                    onboarded: true,
                  });
                  try {
                    const updated = await updateUserProfile(profile);
                    console.log(updated);
                    if (!updated || updated.error) {
                      return false;
                    }

                    if (
                      Object.values(stagedCaregiver).filter(v => !!v).length ===
                      3
                    ) {
                      await inviteCaregiver(
                        stagedCaregiver?.email,
                        stagedCaregiver?.firstName,
                        stagedCaregiver?.lastName
                      );
                    }

                    return updated;
                  } catch (error) {
                    console.log(error);
                    return false;
                  }
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
          {verifyError ? (
            <Text color="red.500">{t('twoFactor.invalidCode')}</Text>
          ) : (
            ''
          )}
        </Center>
      </Stack>
    );
  }
);
