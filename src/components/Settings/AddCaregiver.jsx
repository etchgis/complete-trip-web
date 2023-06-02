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

export const AddCaregiver = ({ onClose }) => {
  const { invite, hydrate } = useStore().caregivers;
  const [changed, setChanged] = useState(false);
  const { setErrorToastMessage } = useStore().authentication;

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
          const reponse = await invite(data.get('caregiverEmail'), firstName, lastName);
          console.log(reponse);
          //TODO show success message
        } catch (error) {
          onClose();
          if (error === 'caregiver already registered for this dependent') {
            setErrorToastMessage(
              'This email is already registered as a Caregiver.'
            );
          } else {
            setErrorToastMessage(
              'There was an error sending the invite.'
            );
          }
        }

        hydrate();
        onClose();

      }}
    >
      <Stack spacing={4}>
        <HStack>
          <FormControl isRequired>
            <FormLabel>First Name</FormLabel>
            <Input type="text" name="caregiverFirstName" isRequired />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Last Name</FormLabel>
            <Input type="text" name="caregiverLastName" isRequired />
          </FormControl>
        </HStack>
        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <Input type="email" name="caregiverEmail" isRequired />
        </FormControl>
        <Button
          bg={'brand'}
          color={'white'}
          _hover={{
            opacity: 0.8,
          }}
          isDisabled={!changed}
          type="submit"
          mt={6}
        >
          Send Invite
        </Button>
      </Stack>
    </Box>
  );
};
