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

const WheelchairToggle = observer(() => {
  const { user, updateUserProfile } = useStore().authentication;
  const preferences = user?.profile?.preferences || {};

  const [wheelchair, setWheelchair] = useState(
    preferences?.wheelchair || false
  );

  const wheelchairOptions = ['Yes', 'No'];

  const { getRootProps: getWheelchairRoot, getRadioProps: getWheelchairProps } =
    useRadioGroup({
      name: 'Wheelchair',
      defaultValue: wheelchair ? 'Yes' : 'No',
      onChange: e => {
        setWheelchair(e === 'Yes' ? true : false);
        updateUserProfile({
          ...user?.profile,
          preferences: {
            ...preferences,
            wheelchair: e === 'Yes' ? true : false,
          },
        });
      },
    });

  const wheelchairGroup = getWheelchairRoot();

  return (
    <FormControl>
      <HStack
        {...wheelchairGroup}
        display={'flex'}
        justifyContent="space-between"
      >
        <Box fontWeight={'bold'} as="p" fontSize={'md'}>
          Wheelchair Accessibility
        </Box>
        <Flex borderRadius={'md'} borderWidth="1px" overflow={'hidden'}>
          {wheelchairOptions.map(value => {
            const radio = getWheelchairProps({ value });
            return (
              <RadioCard key={value} {...radio}>
                {value}
              </RadioCard>
            );
          })}
        </Flex>
      </HStack>
    </FormControl>
  );
});

export default WheelchairToggle;
