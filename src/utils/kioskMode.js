const addressMode = () =>
  new URLSearchParams(window.location.search).get('mode');

// Remembered when the page loads, so moving to an address without the query
// string does not turn a shared device back into a normal one.
const loadedAsKiosk = addressMode() === 'kiosk';

// True when the page was loaded with ?mode=kiosk, or the address has it now.
// Shared devices in stores are stationary, so this is checked before anything
// asks for the device location.
export const isKioskMode = () => loadedAsKiosk || addressMode() === 'kiosk';

// The starting screen mode, decided from the address so nothing renders in the
// wrong mode while the page is starting up.
export const initialUx = () => {
  if (isKioskMode()) return 'kiosk';
  const callcenterPath = window.location.pathname.startsWith('/callcenter');
  return callcenterPath || addressMode() === 'callcenter'
    ? 'callcenter'
    : 'webapp';
};
