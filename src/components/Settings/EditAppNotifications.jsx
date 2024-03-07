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
import useTranslation from '../../models/useTranslation';

export const EditAppNotifications = observer(() => {
  //get caregivers
  //loop through notificationTypes for rider
  //loop through notificationTypes for caregiver
  const { preferences } = useStore();
  const { dependents } = useStore().caregivers;
  const { t } = useTranslation();

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
      <Heading as="h2" size="md" tabIndex={0}>
        {t('settingsNotifications.type')}
      </Heading>
      <Box py={6}>
        <Divider aria-hidden={true} />
      </Box>
      <Heading as="h3" size="md" tabIndex={0}>
        {t('settingsNotifications.rider')}
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
                {t('settingsNotifications.' + n.value)}
              </FormLabel>
              <Switch
                id={`${n.value}Alerts`}
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
            <Divider aria-hidden={true} />
          </Box>
          <Heading as="h3" size="md" tabIndex={0}>
            {t('settingsNotifications.caregiverAlerts')}
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
                    {t(`settingsNotifications.${n.value}`)}
                  </FormLabel>
                  <Switch
                    id={`${n.value}Alerts`}
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
