import {
  Checkbox,
  Divider,
  FormControl,
  FormLabel,
  Spacer,
  Stack,
} from '@chakra-ui/react';

import MaxTransfersSlider from './Accessibility/MaxTransfersSlider.jsx';
import MinimizeWalkingToggle from './Accessibility/MinimizeWalkingToggle.jsx';
import ServiceAnimalToggle from './Accessibility/ServiceAnimalToggle.jsx';
import WheelchairToggle from './Accessibility/WheelchairToggle.jsx';
import config from '../../config';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { useState } from 'react';
import { useStore } from '../../context/RootStore';
import useTranslation from '../../models/useTranslation.js';

export const EditTripPreferences = observer(() => {
  const { user, updateUserProfile } = useStore().authentication;
  const preferences = user?.profile?.preferences || {};

  console.log('preferences', toJS(preferences));

  const [modes, setModes] = useState(preferences?.modes || []);

  const handleModeChange = e => {
    const _modes = preferences?.modes || [];
    if (e.target.checked) {
      setModes([..._modes, e.target.value]);
      updateUserProfile({
        ...user?.profile,
        preferences: { ...preferences, modes: [..._modes, e.target.value] },
      });
    } else {
      setModes(_modes.filter(mode => mode !== e.target.value));
      updateUserProfile({
        ...user?.profile,
        preferences: {
          ...preferences,
          modes: _modes.filter(mode => mode !== e.target.value),
        },
      });
    }
  };
  const { t } = useTranslation();
  return (
    <Stack spacing={4} maxW="xl">
      <WheelchairToggle />
      <ServiceAnimalToggle />
      <MinimizeWalkingToggle />
      <MaxTransfersSlider />
      <Spacer my={10} />
      <Divider aria-hidden={true} />

      <FormControl>
        <FormLabel>{t('settingsPreferences.modes')}</FormLabel>
        <Stack>
          {/* <Checkbox name="mode_bus">Bus</Checkbox>
          <Checkbox name="mode_light_rail">Light Rail</Checkbox>
          <Checkbox name="mode_walk">Walk</Checkbox>
          <Checkbox name="mode_human_shuttle">Human Shuttle</Checkbox>
          <Checkbox name="mode_autonomous_shuttle">Autonomous Shuttle</Checkbox>
          <Checkbox name="mode_rideshare">Rideshare</Checkbox>
          <Checkbox name="mode_scooter">Scooter</Checkbox> */}
          {config.MODES.map(mode => {
            if (mode.id === 'walk') return '';
            return (
              <Checkbox
                key={mode.id}
                name={`mode_${mode}`}
                value={mode.mode}
                isChecked={modes.includes(mode.mode)}
                onChange={handleModeChange}
              >
                {t(`settingsPreferences.${mode?.id}`)}
              </Checkbox>
            );
          })}
        </Stack>
      </FormControl>
      <Divider aria-hidden={true} />

      {/* <FormControl>
        <FormLabel>Enhanced Mobility Options</FormLabel>
        <HStack my={4}>
          <Skeleton startColor="gray.400" endColor="gray.400" h="40px" w="80px">
            Icon
          </Skeleton>
          <Box>
            <Box fontWeight={'bold'}>Title</Box>
            <Box fontSize={'sm'}>email@example.com</Box>
          </Box>
        </HStack>
        <HStack my={4}>
          <Skeleton startColor="gray.400" endColor="gray.400" h="40px" w="80px">
            Icon
          </Skeleton>
          <Box>
            <Box fontWeight={'bold'}>Title</Box>
            <Box fontSize={'sm'}>email@example.com</Box>
          </Box>
        </HStack>
        <Button
          color="brandDark"
          variant="link"
          leftIcon={<AddIcon />}
          size="sm"
        >
          Check for more mobility registrations
        </Button>
      </FormControl> */}
    </Stack>
  );
});
