import {
  Box,
  Flex,
  FormControl,
  HStack,
  useRadioGroup,
} from '@chakra-ui/react';

import RadioCard from '../RadioCard.jsx';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useStore } from '../../../context/RootStore.jsx';

const MinimizeWalkingToggle = observer(() => {
  const { user, updateUserProfile } = useStore().authentication;
  const preferences = user?.profile?.preferences || {};

  const [minimizeWalking, setMinimizeWalking] = useState(
    preferences?.minimizeWalking || false
  );

  const options = ['Yes', 'No'];

  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'Minimize Walking',
    defaultValue: minimizeWalking ? 'Yes' : 'No',
    onChange: e => {
      setMinimizeWalking(e === 'Yes' ? true : false);
      updateUserProfile({
        ...user?.profile,
        preferences: {
          ...preferences,
          minimizeWalking: e === 'Yes' ? true : false,
        },
      });
    },
  });

  const radioGroup = getRootProps();

  return (
    <FormControl>
      <HStack {...radioGroup} display={'flex'} justifyContent="space-between">
        <Box fontWeight={'bold'} as="p" fontSize={'md'}>
          Minimize Walking
        </Box>
        <Flex borderRadius={'md'} borderWidth="1px" overflow={'hidden'}>
          {options.map(value => {
            const radioProps = getRadioProps({ value });
            return (
              <RadioCard key={value} {...radioProps}>
                {value}
              </RadioCard>
            );
          })}
        </Flex>
      </HStack>
    </FormControl>
  );
});

export default MinimizeWalkingToggle;
