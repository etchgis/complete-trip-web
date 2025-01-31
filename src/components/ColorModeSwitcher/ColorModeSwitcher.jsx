import { FaMoon, FaSun } from 'react-icons/fa';
import { IconButton, useColorMode, useColorModeValue } from '@chakra-ui/react';

import { useStore } from '../../context/RootStore';

export const ColorModeSwitcher = props => {
  const { toggleColorMode } = useColorMode();
  const text = useColorModeValue('dark', 'light');
  const SwitchIcon = useColorModeValue(FaMoon, FaSun);
  const { setMapStyle, mapStyle } = useStore().mapStore;

  return (
    <IconButton
      display={'none'}
      size="md"
      fontSize="lg"
      aria-label={`Switch to ${text} mode`}
      data-testid="color-mode-switcher"
      variant="ghost"
      // color={'current'}
      marginLeft="2"
      onClick={() => {
        setMapStyle(mapStyle === 'DAY' ? 'NIGHT' : 'DAY');
        toggleColorMode();
      }}
      icon={<SwitchIcon />}
      {...props}
    />
  );
};
