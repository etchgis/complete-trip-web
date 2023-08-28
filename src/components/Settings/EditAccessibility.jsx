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

export const EditAccessibility = observer(() => {
  return (
    <Box width="380px" id="edit-accessibility">
      <EditNavDirections />
      <Box py={6}>
        <Divider />
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
  return (
    <FormControl display={'flex'} justifyContent={'space-between'}>
      <FormLabel>Navigation Directions</FormLabel>
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
        <option value="Voice On">Voice On</option>
        <option value="Voice Off">Voice Off</option>
      </Select>
    </FormControl>
  );
});

const EditLanguage = observer(() => {
  const { user, updateUserProfile } = useStore().authentication;
  const preferences = user?.profile?.preferences || {};
  const [language, setLanguage] = useState(
    user?.profile?.preferences?.language || 'en'
  );
  return (
    <FormControl display={'flex'} justifyContent={'space-between'}>
      <FormLabel>Display Language</FormLabel>
      <Select
        width={'auto'}
        size={'sm'}
        defaultValue={language || ''}
        onChange={e => {
          setLanguage(e.target.value);
          preferences['language'] = e.target.value;
          updateUserProfile(
            Object.assign({}, user?.profile, { preferences: preferences })
          );
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
            {method.label}
          </FormLabel>
          <Switch
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
