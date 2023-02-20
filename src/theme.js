import { StepsTheme as Steps } from 'chakra-ui-steps';
import { extendTheme } from '@chakra-ui/react';

const customTheme = {
  components: {
    Steps,
    FormLabel: {
      baseStyle: {
        fontWeight: 'bold',
      },
    },
    Button: {
      baseStyle: {
        cursor: 'pointer',
        fontWeight: 500,
        fontSize: '18px',
      },
    },
  },
  colors: {
    // brand: '#3C8AFF',
    // brandDark: '#165BC1',
    brand: '#2465B1',
    brandDark: '#1d5290',
  },
  fonts: {
    heading: `'Open Sans', sans-serif`,
    body: `'Open Sans', sans-serif`,
  },
  initialColorMode: localStorage.getItem('chakra-ui-color-mode')
    ? localStorage.getItem('chakra-ui-color-mode')
    : 'light',
  useSystemColorMode: false,
};

export const theme = extendTheme(customTheme);