// Raised when the ride request does not come back as a created ride. It carries
// the HTTP status when the server answered, and `retryable` says whether the
// caller may send the same idempotency key again. A 409 means another request
// with this key is still being processed, and a dropped connection or an
// unreadable reply leaves the ride's outcome unknown; both are retryable
// because the key lets the server dedupe the retry. Any other answer is a
// definitive refusal. A refusal from the service gate also carries its `code`.
export class RideRequestError extends Error {
  constructor(message, { status = null, retryable = false, code = null } = {}) {
    super(message);
    this.name = 'RideRequestError';
    this.status = status;
    this.retryable = retryable;
    this.code = code;
  }
}

// 409 codes that mean the service refused the booking for good: no driver is on
// duty, or the service is closed. They are not "still processing".
export const GATE_REFUSAL_CODES = ['NO_DRIVER_ON_DUTY', 'SERVICE_CLOSED'];
