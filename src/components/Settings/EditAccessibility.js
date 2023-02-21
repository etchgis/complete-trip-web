import { Box, FormControl, FormLabel, Select } from '@chakra-ui/react';

import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useStore } from '../../context/mobx/RootStore';

export const EditAccessibility = observer(() => {
  const { user, updateUserProfile } = useStore().authentication;
  const preferences = user?.profile?.preferences || {};
  const [language, setLanguage] = useState(
    user?.profile?.preferences?.language || 'en'
  );

  return (
    <Box>
      <FormControl>
        <FormLabel>Language</FormLabel>
        <Select
          defaultValue={language || ''}
          onChange={e => {
            setLanguage(e.target.value);
            preferences['language'] = e.target.value;
            updateUserProfile(
              Object.assign({}, user?.profile, { preferences: preferences })
            );
          }}
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
        </Select>
      </FormControl>
    </Box>
  );
});
