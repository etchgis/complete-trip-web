import { StepsTheme as Steps } from 'chakra-ui-steps';
import { extendTheme } from '@chakra-ui/react';
import { useStore } from 'zustand';

const urlParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlParams.entries());
const { mode } = params;

const customTheme = {
  components: {
    Steps,
    Popover: {
      baseStyle: {
        popper: {
          zIndex: 'popover',
        },
      },
    },
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
    //change color scheme of 'error' state in the alert component
    Divider: {
      baseStyle: {
        'aria-hidden': true,
      },
    },
    Button: {
      baseStyle: {
        cursor: 'pointer',
        fontWeight: 500,
        fontSize: '18px',
        _hover: {
          opacity: 1,
        },
      },
      variants: {
        brand: {
          color: 'white',
          backgroundColor: 'brand',
          _hover: {
            boxShadow: '0 0 0 3px rgba(0, 91, 204, 0.5)',
          },
          _disabled: {
            // backgroundColor: 'blue.400',
            backgroundColor: 'blue.50',
            color: 'ariaGrayLight',
            opacity: 1,
          },
        },
        'brand-outline': {
          color: 'brand',
          backgroundColor: 'white',
          border: '1px solid',
          borderColor: 'brand',
          _hover: {
            boxShadow: '0 0 0 3px rgba(0, 91, 204, 0.5)',
          },
        },
        error: {
          color: 'white',
          backgroundColor: 'ariaRed',
          _hover: {
            boxShadow: '0 0 0 3px rgba(220, 53, 69, 0.5)',
          },
          _disabled: {
            backgroundColor: 'red.50',
            color: 'ariaGrayLight',
            opacity: 1,
          },
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          top: mode === 'kiosk' ? '300px' : '0'
        }
      }
    }
  },
  colors: {
    brand: 'hsl(215, 100%, 35%)', //NOTE PASSES ACCESSIBILITY TESTS
    brandDark: '#1d5290', //NOTE PASSES ACCESSIBILITY TESTS
    ariaRed: 'hsl(0, 100%, 35%)',
    ariaGray: 'hsl(218, 17%, 35%)',
    ariaGreen: 'hsl(125, 50%, 35%)',
    ariaGreenText: 'hsl(125, 55%, 25%)',
    ariaGrayLight: 'hsl(218, 23%, 30%)',
    blue: {
      50: '#e6f4ff',
      100: '#b8e3ff',
      200: '#89d3ff',
      300: '#5ac3ff',
      400: '#2bb2ff',
      500: 'hsl(215, 100%, 35%)', //NOTE custom AAA color
      600: '#0088cc',
      700: '#006e99',
      800: '#005566',
      900: '#003c33',
    },
    green: {
      50: '#e6f4e3',
      100: '#b8e3b3',
      200: '#89d382',
      300: '#5ac352',
      400: '#2bc321',
      500: '#166534', //NOTE custom AAA color
      600: '#0f4d26',
      700: '#073518',
      800: '#001609',
      900: '#000000',
    },
    red: {
      50: '#ffe3e6',
      100: '#ffb3b8',
      200: '#fc8389',
      300: '#f9535a',
      400: '#f6232b',
      500: 'hsl(0, 100%, 35%)', //NOTE this color is used by the Chakra UI Alerts so needed to be overridden with the whole color object
      600: 'hsl(0, 100%, 30%)', //NOTE custom
      700: '#46101f',
      800: '#1f040c',
      900: '#000000',
    },
    theme: {
      // primary: '#005bcc',
      light: '#0072ff',
      // dark: '#004490',
      // warning: '#ffc107',
      // error: '#dc3545',
      // success: '#20c997',
    },
    // trip: '#02597E',
    tripLight: 'hsl(198 97% 30%)',
    tripDim: 'hsl(220 23% 16% / 1)',
  },
  fonts: {
    heading: `'Open Sans', sans-serif`,
    body: `'Open Sans', sans-serif`,
  },
  initialColorMode: localStorage.getItem('chakra-ui-color-mode')
    ? localStorage.getItem('chakra-ui-color-mode')
    : 'light',
  useSystemColorMode: false,
  breakpoints: {
    base: '0em',
    sm: '30em',
    md: '48em',
    lg: '61em',
    xl: '80em',
    '2xl': '96em',
  }
};

export const theme = extendTheme(customTheme);
