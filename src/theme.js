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
    Heading: {
      baseStyle: {
        marginBottom: '2rem',
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
    // brand: {
    //   primary: '#2465B1',
    // },
    //TODO remove 'brand' color and replace with colorScheme 'brand' - light mode is 500, dark is 200
    //TODO make the error, warning, success, highlight color schemes
    //TODO get rid of all other custom colors so that all buttons, icons, etc will be updated with one theme
    blue: {
      50: '#e6f0ff',
      100: '#b3d0ff',
      200: '#80afff',
      300: '#4d8fff',
      400: '#1a6fff',
      500: '#005bcc',
      600: '#004490',
      700: '#00316c',
      800: '#00234a',
      900: '#00152a',
    },
    theme: {
      primary: '#005bcc',
      light: '#0072ff',
      dark: '#004490',
      //NOTE BELOW NEED TO WORK IN LIGHT AND DARK MODE
      warning: '#ffc107',
      error: '#dc3545',
      success: '#20c997',
    },
    nfta: '#004490',
    nftaLight: 'hsl(213.33deg 100% 40%)',
    brand: '#2465B1',
    brandDark: '#1d5290',
    brandText: '#1B69DC',
    trip: '#02597E',
    tripLight: 'hsl(198 97% 30%)',
    tripDark: 'hsl(212 66% 25% / 1)',
    tripDim: 'hsl(220 23% 16% / 1)',
    primary1: '#4072F3',
    primary2: '#7A9EF9',
    secondary1: '#F2F6FF',
    secondary2: '#DAE4FC',
    secondary3: '#EDF1FD',
    white: '#ffffff',
    light: '#e2e2e2',
    medium: '#b8b8b8',
    dark: '#a6a6a6',
    darker: '#8F8F8F',
    black: '#000000',
    danger: '#dc3545',
    warning: '#ffc107',
    success: '#20c997',
    lightModeBackground: '#ffffff',
    darkModeBackground: '#010101',
    darkModeForeground: '#222222',
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
