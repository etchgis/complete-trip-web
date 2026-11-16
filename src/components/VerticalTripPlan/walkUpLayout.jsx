// Sizes shared by the walk-up screens on the shared tablet and the large shared screen.
import { Global } from '@emotion/react';
import { isTabletKiosk } from '../../models/kiosk-layout';

// Screens at least this wide (the shared tablet and the large shared screen)
// get bigger text, buttons and spacing. Phone width keeps the compact sizes.
const BIG_SCREEN_MIN_WIDTH = 700;

// Height of the on-screen keyboard while this form is open on a large screen.
export const BIG_KEYBOARD_HEIGHT = 410;

const COMPACT = {
  big: false,
  heading: undefined,
  title: undefined,
  body: '20px',
  label: '20px',
  hint: '18px',
  error: 'lg',
  button: '20px',
  buttonH: isTabletKiosk ? '56px' : '64px',
  input: '20px',
  inputH: isTabletKiosk ? '56px' : '64px',
  gap: 4,
  fieldGap: 4,
  rowGap: 2,
  close: isTabletKiosk ? '56px' : '64px',
  chooseH: isTabletKiosk ? '56px' : '64px',
  maxW: '560px',
};

const TABLET_BIG = {
  big: true,
  heading: '46px',
  title: '38px',
  body: '30px',
  label: '30px',
  hint: '26px',
  error: '28px',
  button: '32px',
  buttonH: '90px',
  input: '32px',
  inputH: '84px',
  gap: 6,
  fieldGap: 6,
  rowGap: 5,
  close: '96px',
  chooseH: '160px',
  imageH: '230px',
  maxW: '720px',
};

const LARGE_BIG = {
  big: true,
  heading: '64px',
  title: '48px',
  body: '34px',
  label: '34px',
  hint: '28px',
  error: '32px',
  button: '36px',
  buttonH: '128px',
  input: '36px',
  inputH: '112px',
  gap: 10,
  fieldGap: 8,
  rowGap: 6,
  close: '104px',
  chooseH: '230px',
  imageH: '340px',
  maxW: '900px',
};

// Read when a screen draws, so it follows the window the form opens in.
export const getSizes = () => {
  if (typeof window === 'undefined' || window.innerWidth < BIG_SCREEN_MIN_WIDTH) return COMPACT;
  return isTabletKiosk ? TABLET_BIG : LARGE_BIG;
};

// Where a form sits on a big screen: it covers the whole screen (above the
// on-screen keyboard when there is one). The top padding is the same on every
// screen, so the heading stays in the same place.
export const bigFormProps = (bannerHeight, aboveKeyboard) => ({
  position: 'fixed',
  top: `${bannerHeight}px`,
  left: 0,
  right: 0,
  bottom: aboveKeyboard ? `${BIG_KEYBOARD_HEIGHT}px` : 0,
  transform: 'none',
  w: '100%',
  h: 'auto',
  paddingX: '48px',
  paddingTop: `${isTabletKiosk ? 48 : 72}px`,
  paddingBottom: '24px',
  alignItems: 'flex-start',
  justifyContent: 'center',
  overflowY: 'auto',
  borderRadius: 0,
});

// Makes the on-screen keyboard taller, with larger keys, while a form is open
// on a large screen.
export const BigKeyboardStyles = () => (
  <Global
    styles={{
      '[data-test-id="keyboard"]': { height: `${BIG_KEYBOARD_HEIGHT}px !important` },
      '[data-test-id="keyboard"] > div:last-of-type': { maxWidth: '1000px !important' },
      '[data-test-id="keyboard"] .hg-theme-default': { fontSize: '30px' },
      '[data-test-id="keyboard"] .hg-button': { height: '64px !important' },
      '[data-test-id="keyboard"] .hg-row': { marginBottom: '8px !important' },
    }}
  />
);
