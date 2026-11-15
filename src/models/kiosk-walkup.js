/**
 * Switches for booking the shuttle at a kiosk with a name and phone number
 * instead of a PIN.
 *
 * With every switch off the kiosk behaves as it always has: Summon Shuttle
 * opens the PIN form directly.
 */

import { getCurrentKioskConfig } from './kiosk-definitions';

// Turns the feature on in this build. Off unless the build sets it.
export const walkUpEnabledInBuild = import.meta.env.VITE_KIOSK_WALKUP === 'true';

// For showing the screens only. When the build sets it, the flow is on for every
// kiosk and every answer comes from the browser (see demoRides.js).
export const walkUpDemo = import.meta.env.VITE_KIOSK_WALKUP_DEMO === 'true';

// True only when the demo is built in AND the page is a kiosk page
// (?mode=kiosk). The call center and the web app never see demo behavior, even
// if a demo build is served from the same site.
export const isWalkUpDemoActive = () =>
  walkUpDemo && getCurrentKioskConfig() !== null;

const CREDENTIAL_KEY = 'kioskDeviceCredential';

// The credential that proves this device is a trusted shared kiosk. Enrolling a
// device is not built yet, so nothing writes this key today and it is always
// missing in practice.
export const getKioskDeviceCredential = () => {
  try {
    return window.localStorage.getItem(CREDENTIAL_KEY) || null;
  } catch (e) {
    return null;
  }
};

/**
 * Whether Summon Shuttle should offer the name and phone choice.
 *
 * @param {object|null} kioskConfig the current kiosk definition
 * @param {object} [flags] overrides for tests
 */
export const isWalkUpAvailable = (
  kioskConfig,
  {
    enabledInBuild = walkUpEnabledInBuild,
    demo = isWalkUpDemoActive(),
    credential = getKioskDeviceCredential(),
  } = {}
) => {
  if (demo) return true;
  return Boolean(enabledInBuild && kioskConfig?.walkUpBooking && credential);
};
