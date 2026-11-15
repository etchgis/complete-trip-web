/**
 * Canned ride answers for showing the kiosk design. This file is for the demo
 * only: it never talks to a server and it is used only when the build sets
 * VITE_KIOSK_WALKUP_DEMO and the page is a kiosk page.
 *
 * The last 4 digits of the phone number pick the answer:
 *   0101 no driver on duty    0102 service closed     0103 could not book
 *   0104 too many tries       0105 no answer, then books when retried
 *   anything else books after about one second.
 * For a PIN request the PIN must be 1234; any other PIN is refused.
 */

import { GATE_REFUSAL_CODES, RideRequestError } from './rideRequestError';

export const DEMO_NO_DRIVER_TEXT =
  'The NFTA Community Shuttle is not in service right now. Please check back later or explore other transit options.';
export const DEMO_CLOSED_TEXT = 'The NFTA Community Shuttle is closed at that time.';
export const DEMO_PIN = '1234';

// A short wait so the "no answer" case can be shown without a 20 second pause.
export const DEMO_TIMEOUT_MS = 4000;

const BOOK_DELAY_MS = 1000;
const REFUSE_DELAY_MS = 600;

// Keys that already got their one silent answer for number 0105.
const silentKeys = new Set();

const later = (ms, make) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(make());
      } catch (e) {
        reject(e);
      }
    }, ms);
  });

const booked = () => later(BOOK_DELAY_MS, () => ({ id: 'demo-ride' }));
const refused = error => later(REFUSE_DELAY_MS, () => { throw error; });

/**
 * @param {string} phone digits, with or without a leading +1
 * @param {string} [idempotencyKey]
 * @returns {Promise<object>} resolves with a ride, rejects with RideRequestError
 */
export const demoAnswerForPhone = (phone, idempotencyKey) => {
  const last4 = String(phone || '').slice(-4);
  switch (last4) {
    case '0101':
      return refused(new RideRequestError(DEMO_NO_DRIVER_TEXT, { status: 409, code: 'NO_DRIVER_ON_DUTY' }));
    case '0102':
      return refused(new RideRequestError(DEMO_CLOSED_TEXT, { status: 409, code: 'SERVICE_CLOSED' }));
    case '0103':
      return refused(new RideRequestError('invalid pin', { status: 400 }));
    case '0104':
      return refused(new RideRequestError('too many requests', { status: 429, code: 'TRY_LATER' }));
    case '0105':
      if (!silentKeys.has(idempotencyKey)) {
        silentKeys.add(idempotencyKey);
        // Never answers, so the caller's wait runs out.
        return new Promise(() => {});
      }
      return booked();
    default:
      return booked();
  }
};

export const demoWalkUpRequest = ({ phone, idempotencyKey }) =>
  demoAnswerForPhone(phone, idempotencyKey);

export const demoPinRequest = ({ phone, pin, idempotencyKey }) => {
  if (pin !== DEMO_PIN) {
    return refused(new RideRequestError('invalid pin', { status: 400 }));
  }
  return demoAnswerForPhone(phone, idempotencyKey);
};

export const isGateRefusal = e => GATE_REFUSAL_CODES.includes(e?.code);
