/**
 * Screen layout and keyboard settings for kiosk mode, read from the device
 * block in each kiosk definition.
 *
 * device.screen is "large" for a 1080x1920 portrait screen, which has a tall
 * banner, or "tablet" for a smaller screen that uses all of its height for the app.
 * device.hasKeyboard says whether the device supplies its own keyboard. Without
 * one the app shows its on-screen keyboard.
 */

import { getCurrentKioskConfig } from './kiosk-definitions';

const device = getCurrentKioskConfig()?.device;

// These are decided once on load because the theme needs the answer before any
// component renders.
export const isTabletKiosk = device?.screen === 'tablet';
export const kioskHasOwnKeyboard = device?.hasKeyboard === true;

// The visible height of a tablet screen. It follows the browser bars and the
// tablet keyboard as they appear and disappear, which 100vh does not.
export const TABLET_SCREEN_HEIGHT = '100dvh';

/**
 * Makes the tablet keyboard shrink the page instead of covering it, so the
 * button under a form can still be reached while typing.
 */
export const applyTabletKioskViewport = () => {
  if (!isTabletKiosk) return;
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.content = `${viewport.content}, interactive-widget=resizes-content`;
  }
};
