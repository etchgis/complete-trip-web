import {
  Box,
  Divider,
  FormControl,
  FormLabel,
  Select,
  Stack,
  Switch,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import config from '../../config';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../context/RootStore';
import useTranslation from '../../models/useTranslation';

export const EditAccessibility = observer(() => {
  return (
    <Box width="100%" maxW="500px" id="edit-accessibility">
      <EditNavDirections />
      <Box py={6}>
        <Divider aria-hidden={true} />
      </Box>
      <EditLanguage />
      <EditNotifyMethods />
    </Box>
  );
});

const EditNavDirections = observer(() => {
  const { user, updateUserProfile } = useStore().authentication;
  const preferences = user?.profile?.preferences || {};
  const [navDirections, setNavDirections] = useState(
    user?.profile?.preferences?.navigationDirections || 'Voice On'
  );
  const { t } = useTranslation();
  return (
    <FormControl display={'flex'} justifyContent={'space-between'}>
      <FormLabel>{t('settingsAccessibility.directions')}</FormLabel>
      <Select
        width={'auto'}
        size={'sm'}
        defaultValue={navDirections || ''}
        onChange={e => {
          setNavDirections(e.target.value);
          preferences['navigationDirections'] = e.target.value;
          updateUserProfile(
            Object.assign({}, user?.profile, { preferences: preferences })
          );
        }}
      >
        <option value="Voice On">{t('settingsAccessibility.voiceOn')}</option>
        <option value="Voice Off">{t('settingsAccessibility.voiceOff')}</option>
      </Select>
    </FormControl>
  );
});

export const EditLanguage = observer(() => {
  const { user, updateUserProfile } = useStore().authentication;
  const { ui, setUI } = useStore().uiStore;

  const preferences = user?.profile?.preferences || {};
  const [language, setLanguage] = useState(
    user?.profile?.preferences?.language || ui?.language || 'en'
  );

  const { t } = useTranslation();

  return (
    <FormControl display={'flex'} justifyContent={'space-between'}>
      <FormLabel>{t('settingsAccessibility.language')}</FormLabel>
      <Select
        width={'auto'}
        size={'sm'}
        defaultValue={language || ''}
        onChange={e => {
          if (user && user?.profile) {
            setLanguage(e.target.value);
            preferences['language'] = e.target.value;
            updateUserProfile(
              Object.assign({}, user?.profile, { preferences: preferences })
            );
          }

          setUI({ language: e.target.value }); //TODO move this to Routes so it's at the root
        }}
      >
        {Object.keys(config.LANAGUAGES).map(key => (
          <option key={key} value={key}>
            {config.LANAGUAGES[key]}
          </option>
        ))}
      </Select>
    </FormControl>
  );
});

const EditNotifyMethods = observer(() => {
  const { user, updateUserProfile } = useStore().authentication;
  const [changed, setChanged] = useState(false);
  //NOTE using state here allows for the UI to change first, then the DB is updated
  const [notifications, setNotifications] = useState(
    user?.profile?.preferences?.notifications || []
  );
  const { t } = useTranslation();
  useEffect(() => {
    if (!changed) return;
    const preferences = Object.assign({}, user?.profile?.preferences);
    preferences['notifications'] = [...notifications];
    (async () => {
      const update = await updateUserProfile(
        Object.assign({}, user?.profile, { preferences: preferences })
      );
      if (update.error) {
        setNotifications(user?.profile?.preferences?.notifications || []);
      }
    })();
    // eslint-disable-next-line
  }, [notifications]);

  const handleAlertChange = e => {
    if (e.target.checked) {
      // console.log(e.target.value, true);
      setNotifications([...notifications, e.target.value]);
    } else {
      // console.log(e.target.value, false);
      setNotifications(current => current.filter(n => n !== e.target.value));
    }
  };

  return (
    <Stack spacing={4} as="form" onChange={() => setChanged(true)} my={4}>
      {config.NOTIFY_METHODS.map(method => (
        <FormControl
          key={method.value}
          display="flex"
          alignItems="center"
          justifyContent={'space-between'}
        >
          <FormLabel htmlFor={`${method.value}Alerts`} mb="0" minW={'12'}>
            {t(`settingsAccessibility.${method.value.toLowerCase()}`)}
          </FormLabel>
          <Switch
            id={`${method.value}Alerts`}
            name={`${method.value}Alerts`}
            onChange={handleAlertChange}
            value={method.value}
            isChecked={notifications.includes(method.value) ? true : false}
          />
        </FormControl>
      ))}
    </Stack>
  );
});
