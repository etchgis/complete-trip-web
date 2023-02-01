import { FaMoon, FaSun } from 'react-icons/fa';
import { IconButton, useColorMode, useColorModeValue } from '@chakra-ui/react';

import { useMapStore } from '../../context/MapStore';

export const ColorModeSwitcher = props => {
  const { toggleColorMode } = useColorMode();
  const text = useColorModeValue('dark', 'light');
  const SwitchIcon = useColorModeValue(FaMoon, FaSun);
  const { setMapStyle, mapStyle } = useMapStore();

  return (
    <IconButton
      size="md"
      fontSize="lg"
      aria-label={`Switch to ${text} mode`}
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
