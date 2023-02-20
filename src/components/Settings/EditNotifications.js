import { FormControl, FormLabel, Stack, Switch } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import { observer } from 'mobx-react-lite';
import { useStore } from '../../context/mobx/RootStore';

export const EditNotifications = observer(() => {
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
      console.log(e.target.value, true);
      setNotifications([...notifications, e.target.value]);
    } else {
      console.log(e.target.value, false);
      setNotifications(current => current.filter(n => n !== e.target.value));
    }
  };

  return (
    <Stack spacing={2} as="form" onChange={() => setChanged(true)}>
      <FormControl display="flex" alignItems="center" pl={10} mb={2}>
        <FormLabel htmlFor="smsAlerts" mb="0" minW={'12'}>
          SMS
        </FormLabel>
        <Switch
          name="smsAlerts"
          onChange={handleAlertChange}
          value="sms"
          isChecked={notifications.includes('sms') ? true : false}
        />
      </FormControl>

      <FormControl display="flex" alignItems="center" pl={10}>
        <FormLabel htmlFor="emailAlerts" mb="0" minW={12}>
          Email
        </FormLabel>
        <Switch
          name="emailAlerts"
          onChange={handleAlertChange}
          value="email"
          isChecked={notifications.includes('email') ? true : false}
        />
      </FormControl>
    </Stack>
  );
});
