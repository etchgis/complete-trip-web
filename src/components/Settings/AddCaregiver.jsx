import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Stack,
} from '@chakra-ui/react';

import { useState } from 'react';
import { useStore } from '../../context/RootStore';
import useTranslation from '../../models/useTranslation';

export const AddCaregiver = ({ onClose }) => {
  const { invite, hydrate } = useStore().caregivers;
  const [changed, setChanged] = useState(false);
  const { setErrorToastMessage } = useStore().authentication;
  const { t } = useTranslation();
  return (
    <Box
      as="form"
      onChange={() => setChanged(true)}
      onSubmit={async e => {
        e.preventDefault();
        const data = new FormData(e.target);
        const firstName = data.get('caregiverFirstName');
        const lastName = data.get('caregiverLastName');
        try {
          const reponse = await invite(
            data.get('caregiverEmail'),
            firstName,
            lastName
          );
          console.log(reponse);
          //TODO show success message
        } catch (error) {
          onClose();
          if (error === 'caregiver already registered for this dependent') {
            setErrorToastMessage(
              t('settingsCaregivers.caregiverAlreadyRegistered')
            );
          } else {
            setErrorToastMessage(t('settingsCaregivers.inviteError'));
          }
        }

        hydrate();
        onClose();
      }}
    >
      <Stack spacing={4}>
        <HStack>
          <FormControl isRequired>
            <FormLabel>{t('global.firstName')}</FormLabel>
            <Input type="text" name="caregiverFirstName" isRequired />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>{t('global.lastName')}</FormLabel>
            <Input type="text" name="caregiverLastName" isRequired />
          </FormControl>
        </HStack>
        <FormControl isRequired>
          <FormLabel>{t('global.email')}</FormLabel>
          <Input type="email" name="caregiverEmail" isRequired />
        </FormControl>
        <Button variant={'brand'} isDisabled={!changed} type="submit" mt={6}>
          {t('settingsCaregivers.inviteCaregiver')}
        </Button>
      </Stack>
    </Box>
  );
};
