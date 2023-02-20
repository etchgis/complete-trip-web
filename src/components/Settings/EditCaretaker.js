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

import formatters from '../../utils/formatters';
import { toJS } from 'mobx';
import { useState } from 'react';
import { useStore } from '../../context/mobx/RootStore';

export const EditCaretaker = ({ id, onClose }) => {
  const { user, updateUserProfile } = useStore().authentication;
  const [changed, setChanged] = useState(false);
  // console.log(user?.profile?.caretakers[id]);
  const caretakers = user?.profile?.caretakers
    ? toJS(user.profile.caretakers)
    : [];
  const [phone, setPhone] = useState(
    caretakers[id]?.phone
      ? formatters.phone.asDomestic(caretakers[id]?.phone.slice(2))
      : ''
  );
  console.log({ caretakers });
  console.log({ id });

  return (
    <Box
      as="form"
      onChange={() => setChanged(true)}
      onSubmit={async e => {
        e.preventDefault();
        const data = new FormData(e.target);
        // console.log(...data);
        const update = {
          firstName: data.get('caretakerFirstName'),
          lastName: data.get('caretakerLastName'),
          phone: `+1${data.get('caretakerPhone').replace(/-/g, '')}`,
          email: data.get('caretakerEmail'),
        };
        if (caretakers.length > 0 && (id || id === 0)) {
          caretakers[id] = update;
        } else {
          caretakers.push(update);
        }
        // console.log({ caretakers })
        await updateUserProfile(
          Object.assign({}, user?.profile, { caretakers: caretakers })
        );
        onClose();
      }}
    >
      <Stack spacing={4}>
        <HStack>
          <FormControl isRequired>
            <FormLabel>First Name</FormLabel>
            <Input
              type="text"
              name="caretakerFirstName"
              isRequired
              defaultValue={caretakers[id]?.firstName || ''}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Last Name</FormLabel>
            <Input
              type="text"
              name="caretakerLastName"
              isRequired
              defaultValue={caretakers[id]?.lastName || ''}
            />
          </FormControl>
        </HStack>
        <FormControl isRequired>
          <FormLabel>Phone</FormLabel>
          <Input
            type="tel"
            name="caretakerPhone"
            pattern="^\d{3}-\d{3}-\d{4}$"
            value={phone}
            isRequired
            onChange={e =>
              setPhone(formatters.phone.asDomestic(e.target.value))
            }
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            name="caretakerEmail"
            isRequired
            defaultValue={caretakers[id]?.email || ''}
          />
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
          Save
        </Button>
        {id || id === 0 ? (
          <Button
            bg={'red.100'}
            color={'white'}
            _hover={{
              bg: 'red.500',
            }}
            type="button"
            onClick={async () => {
              if (!id && id !== 0) return;
              caretakers.splice(id, 1);
              console.log({ caretakers });
              await updateUserProfile(
                Object.assign({}, user?.profile, { caretakers: caretakers })
              );
              onClose();
            }}
            mt={6}
          >
            Delete Caretaker
          </Button>
        ) : (
          ''
        )}
      </Stack>
    </Box>
  );
};
