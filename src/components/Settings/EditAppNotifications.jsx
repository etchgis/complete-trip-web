import {
  Box,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Stack,
  Switch,
} from '@chakra-ui/react';

import config from '../../config';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../context/RootStore';

export const EditAppNotifications = observer(() => {
  //get caregivers
  //loop through notificationTypes for rider
  //loop through notificationTypes for caregiver
  const { preferences } = useStore();
  const { dependents } = useStore().caregivers;

  const handleTypeChange = (e, types) => {
    if (e.target.checked) {
      console.log(e.target.value);
      preferences.addNotificationType(types);
    } else {
      preferences.removeNotificationType(types);
    }
  };

  return (
    <Box width={{ base: '100%' }} maxW="500px">
      <Flex justifyContent={'space-between'}>
        <p>Notification Preference Type</p>
        <p>Settings</p>
      </Flex>
      <Box py={6}>
        <Divider />
      </Box>
      <Heading as="h3" size="md">
        Rider Notification Alerts
      </Heading>
      <Stack spacing={2}>
        {config.NOTIFICATION_TYPES.traveler.map((n, i) => {
          let selected = false;
          for (let j = 0; j < n.types.length; j++) {
            if (preferences.notificationTypes.indexOf(n.types[j]) > -1) {
              selected = true;
            }
          }
          return (
            <FormControl
              key={i.toString()}
              display="flex"
              alignItems="center"
              justifyContent={'space-between'}
            >
              <FormLabel htmlFor={`${n.value}Alerts`} fontWeight={400}>
                {n.label}
              </FormLabel>
              <Switch
                name={`${n.value}Alerts`}
                onChange={e => handleTypeChange(e, n.types)}
                value={n.value}
                isChecked={selected}
              />
            </FormControl>
          );
        })}
      </Stack>
      {dependents.length ? (
        <>
          <Box py={6}>
            <Divider />
          </Box>
          <Heading as="h3" size="md">
            Caregiver Notification Alerts
          </Heading>
          <Stack spacing={2}>
            {config.NOTIFICATION_TYPES.caregiver.map((n, i) => {
              let selected = false;
              for (let j = 0; j < n.types.length; j++) {
                if (preferences.notificationTypes.indexOf(n.types[j]) > -1) {
                  selected = true;
                }
              }
              return (
                <FormControl
                  key={i.toString()}
                  display="flex"
                  alignItems="center"
                  justifyContent={'space-between'}
                >
                  <FormLabel htmlFor={`${n.value}Alerts`} fontWeight={400}>
                    {n.label}
                  </FormLabel>
                  <Switch
                    name={`${n.value}Alerts`}
                    onChange={e => handleTypeChange(e, n.types)}
                    value={n.value}
                    isChecked={selected}
                  />
                </FormControl>
              );
            })}
          </Stack>
        </>
      ) : null}
    </Box>
  );
});
