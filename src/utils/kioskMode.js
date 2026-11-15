// True when the address has ?mode=kiosk. Shared devices in stores are
// stationary, so this is checked before anything asks for the device location.
export const isKioskMode = () =>
  new URLSearchParams(window.location.search).get('mode') === 'kiosk';

// The starting screen mode, decided from the address so nothing renders in the
// wrong mode while the page is starting up.
export const initialUx = () => {
  const mode = new URLSearchParams(window.location.search).get('mode');
  return mode === 'kiosk' || mode === 'callcenter' ? mode : 'webapp';
};
