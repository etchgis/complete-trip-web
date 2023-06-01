import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Stack,
  VisuallyHiddenInput,
} from '@chakra-ui/react';

import { hydrate } from 'react-dom';
import { useState } from 'react';
import { useStore } from '../../context/RootStore';

export const AddCaregiver = ({ id, onClose }) => {
  const { invite, hydrate } = useStore().caregivers;
  const [changed, setChanged] = useState(false);
  const { setErrorToastMessage } = useStore().authentication;
  // console.log({ caregivers });
  console.log({ id });

  return (
    <Box
      as="form"
      onChange={() => setChanged(true)}
      onSubmit={async e => {
        e.preventDefault();
        const data = new FormData(e.target);
        const name = `${data.get('caregiverFirstName')} ${data.get(
          'caregiverLastName'
        )}`;
        try {
          await invite(data.get('caregiverEmail'), name);
          await hydrate();
          onClose();
          //TODO show success message
        } catch (error) {
          onClose();
          if (error === 'caregiver already registered for this dependent') {
            setErrorToastMessage(
              'This email is already registered as a Caregiver.'
            );
          } else {
            setErrorToastMessage(
              'There was an error sending the invite. Please try again or contact support.'
            );
          }
        }
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
        <FormControl>
          <VisuallyHiddenInput
            type="number"
            name="id"
            value={id}
            readOnly
          ></VisuallyHiddenInput>
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
