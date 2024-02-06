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

const ServiceAnimalToggle = observer(() => {
  const { user, updateUserProfile } = useStore().authentication;
  const preferences = user?.profile?.preferences || {};

  const [serviceAnimal, setServiceAnimal] = useState(
    preferences?.serviceAnimal || false
  );

  const serviceAnimalOptions = ['Yes', 'No'];

  const {
    getRootProps: getServiceAnimalRoot,
    getRadioProps: getServiceAnimalProps,
  } = useRadioGroup({
    name: 'ServiceAnimal',
    defaultValue: serviceAnimal ? 'Yes' : 'No',
    onChange: e => {
      setServiceAnimal(e === 'Yes' ? true : false);
      updateUserProfile({
        ...user?.profile,
        preferences: {
          ...preferences,
          serviceAnimal: e === 'Yes' ? true : false,
        },
      });
    },
  });

  const serviceAnimalGroup = getServiceAnimalRoot();
  const { t } = useTranslation();
  return (
    <FormControl>
      <HStack
        {...serviceAnimalGroup}
        display={'flex'}
        justifyContent="space-between"
      >
        <Box fontWeight={'bold'} as="p" fontSize={'md'}>
          {t('settingsPreferences.serviceAnimal')}
        </Box>
        <Flex borderRadius={'md'} borderWidth="1px" overflow={'hidden'}>
          {serviceAnimalOptions.map(value => {
            const radio = getServiceAnimalProps({ value });
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

export default ServiceAnimalToggle;
