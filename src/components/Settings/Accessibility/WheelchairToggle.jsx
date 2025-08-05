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
import useTranslation from '../../../models/useTranslation.js';

const WheelchairToggle = observer(() => {
  const { user, updateUserProfile } = useStore().authentication;
  const preferences = user?.profile?.preferences || {};

  const [wheelchair, setWheelchair] = useState(
    preferences?.wheelchair || false
  );
  const wheelchairOptions = ['yes', 'no'];

  const { getRootProps: getWheelchairRoot, getRadioProps: getWheelchairProps } =
    useRadioGroup({
      name: 'Wheelchair',
      defaultValue: wheelchair ? 'yes' : 'no',
      onChange: e => {
        setWheelchair(e === 'yes' ? true : false);
        updateUserProfile({
          ...user?.profile,
          preferences: {
            ...preferences,
            wheelchair: e === 'yes' ? true : false,
          },
        });
      },
    });

  const wheelchairGroup = getWheelchairRoot();
  const { t } = useTranslation();
  return (
    <FormControl>
      <HStack
        {...wheelchairGroup}
        display={'flex'}
        justifyContent="space-between"
      >
        <Box fontWeight={'bold'} as="p" fontSize={'md'}>
          {t('settingsPreferences.wheelchair')}
        </Box>
        <Flex borderRadius={'md'} borderWidth="1px" overflow={'hidden'}>
          {wheelchairOptions.map(value => {
            const radio = getWheelchairProps({ value });
            return (
              <RadioCard
                key={value}
                {...radio}
                label={t('settingsPreferences.wheelchair')}
              >
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
