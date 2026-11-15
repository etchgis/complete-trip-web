// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';

import UIStore from '../context/UIStore';
import { StoreProvider } from '../context/RootStore';
import config from '../config';
import WalkUpBookingModal, { WALKUP_IDLE_MS, clearPendingBooking } from '../components/VerticalTripPlan/WalkUpBookingModal';
import { RideRequestError } from '../services/transport/rideRequestError';

const requestWalkUp = vi.fn();
const verdict = vi.fn();

vi.mock('../services/transport/rides', async () => {
  const errors = await import('../services/transport/rideRequestError');
  return {
    default: { requestWalkUp: (...args) => requestWalkUp(...args) },
    ...errors,
  };
});

vi.mock('../hooks/useServiceAvailability', () => ({
  checkServiceAvailability: (...args) => verdict(...args),
}));

const makeStore = () => {
  const uiStore = new UIStore({});
  uiStore.ux = 'kiosk';
  return {
    uiStore,
    trip: { request: { destination: { title: 'Tops', address: '1 Main St', point: { lat: 42.9, lng: -78.8 } } } },
  };
};

let store;
let onClose;
let onSuccess;
let onChoosePin;

const renderModal = (props = {}) =>
  render(
    <ChakraProvider>
      <StoreProvider store={store}>
        <WalkUpBookingModal
          isOpen
          onClose={onClose}
          onSuccess={onSuccess}
          onChoosePin={onChoosePin}
          {...props}
        />
      </StoreProvider>
    </ChakraProvider>
  );

const type = (label, value) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
// A check-screen row has a bold label and the value in separate elements.
const rowText = text => screen.getByText((_, el) => el.tagName === 'P' && el.textContent === text);
const click = name => fireEvent.click(screen.getByRole('button', { name }));

const goToNameScreen = () => click(/Use my name and phone number/);

const fillName = () => {
  type('First name', 'Ana');
  type('Last name', 'Diaz');
  type('Phone number', '7165550123');
};

const goToCheck = () => {
  goToNameScreen();
  fillName();
  click('Next');
  click('Skip');
};

beforeEach(() => {
  store = makeStore();
  onClose = vi.fn();
  onSuccess = vi.fn();
  onChoosePin = vi.fn();
  clearPendingBooking();
  requestWalkUp.mockReset();
  verdict.mockReset();
  verdict.mockResolvedValue('available');
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('screen A', () => {
  test('shows both ways to book and a Back button', () => {
    renderModal();
    expect(screen.getByRole('heading', { name: 'Call the shuttle' })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Use my name and phone number/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'I have a PIN' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Back' })).toBeTruthy();
  });

  test('I have a PIN hands over to the PIN form', () => {
    renderModal();
    click('I have a PIN');
    expect(onChoosePin).toHaveBeenCalled();
  });
});

describe('name and phone', () => {
  test('empty fields show an error each and mark the fields invalid', () => {
    renderModal();
    goToNameScreen();
    click('Next');
    expect(screen.getByText('Type your first name.')).toBeTruthy();
    expect(screen.getByText('Type your last name.')).toBeTruthy();
    expect(screen.getByText('Type all 10 digits of your phone number.')).toBeTruthy();
    expect(screen.getByLabelText('First name').getAttribute('aria-invalid')).toBe('true');
  });

  test('the steps use no form, so Next cannot submit a form around the modal', () => {
    const { container } = renderModal();
    goToNameScreen();
    expect(container.querySelector('form')).toBeNull();
    type('First name', 'Maria');
    type('Last name', 'Lopez');
    type('Phone number', '7165550123');
    fireEvent.keyDown(screen.getByLabelText('Phone number'), { key: 'Enter' });
    expect(screen.getByText('Do you want the app?')).toBeTruthy();
    expect(container.querySelector('form')).toBeNull();
  });

  test('phone is digits only, at most 10, shown formatted', () => {
    renderModal();
    goToNameScreen();
    type('Phone number', '(716) 555-0123 99');
    expect(screen.getByLabelText('Phone number').value).toBe('(716) 555-0123');
  });

  test('a short phone is refused', () => {
    renderModal();
    goToNameScreen();
    fillName();
    type('Phone number', '71655');
    click('Next');
    expect(screen.getByText('Type all 10 digits of your phone number.')).toBeTruthy();
  });
});

describe('email', () => {
  test('is optional: Skip goes to the check screen with no app link', () => {
    renderModal();
    goToNameScreen();
    fillName();
    click('Next');
    expect(screen.getByRole('heading', { name: 'Do you want the app?' })).toBeTruthy();
    click('Skip');
    expect(rowText('App link: No')).toBeTruthy();
  });

  test('a bad email shows an error', () => {
    renderModal();
    goToNameScreen();
    fillName();
    click('Next');
    type(/Email/, 'nope');
    click('Next');
    expect(screen.getByText('This email does not look right. Check it or leave it blank.')).toBeTruthy();
  });

  test('a good email shows on the check screen', () => {
    renderModal();
    goToNameScreen();
    fillName();
    click('Next');
    type(/Email/, 'ana@example.com');
    click('Next');
    expect(rowText('App link: Send to ana@example.com')).toBeTruthy();
  });
});

describe('check screen', () => {
  test('repeats what was typed with a formatted phone', () => {
    renderModal();
    goToCheck();
    expect(rowText('Name: Ana Diaz')).toBeTruthy();
    expect(rowText('Phone: (716) 555-0123')).toBeTruthy();
    expect(rowText('Going to: Tops')).toBeTruthy();
  });
});

describe('calling the shuttle', () => {
  test('success reports whether an email was given', async () => {
    requestWalkUp.mockResolvedValue({ id: 'r1' });
    renderModal();
    goToCheck();
    click('Call the shuttle');
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith({ hasEmail: false }));
    const sent = requestWalkUp.mock.calls[0][0];
    expect(sent.phone).toBe('+17165550123');
    expect(sent.firstName).toBe('Ana');
    expect(sent.idempotencyKey).toBeTruthy();
  });

  test('a gate refusal shows the server text', async () => {
    requestWalkUp.mockRejectedValue(
      new RideRequestError('The NFTA Community Shuttle is closed at that time.', { status: 409, code: 'SERVICE_CLOSED' })
    );
    renderModal();
    goToCheck();
    click('Call the shuttle');
    expect(await screen.findByRole('heading', { name: 'The shuttle cannot come right now' })).toBeTruthy();
    expect(screen.getByText('The NFTA Community Shuttle is closed at that time.')).toBeTruthy();
    click('See other ways to go');
    expect(onClose).toHaveBeenCalled();
  });

  test('a uniform 400 shows the could-not-book screen', async () => {
    requestWalkUp.mockRejectedValue(new RideRequestError('invalid pin', { status: 400 }));
    renderModal();
    goToCheck();
    click('Call the shuttle');
    expect(await screen.findByRole('heading', { name: 'We could not book this ride' })).toBeTruthy();
  });

  test('the could-not-book screen has a tap-to-call link for the Call Center', async () => {
    requestWalkUp.mockRejectedValue(new RideRequestError('invalid pin', { status: 400 }));
    renderModal();
    goToCheck();
    click('Call the shuttle');
    const link = await screen.findByRole('link', { name: 'Call the Call Center at 716-888-4600' });
    expect(link.getAttribute('href')).toBe('tel:+17168884600');
    expect(link.textContent).toBe('716-888-4600');
  });

  test('the phone line is left out when no number is set', async () => {
    const saved = config.CALL_CENTER_PHONE;
    config.CALL_CENTER_PHONE = { display: '', tel: '' };
    try {
      requestWalkUp.mockRejectedValue(new RideRequestError('invalid pin', { status: 400 }));
      renderModal();
      goToCheck();
      click('Call the shuttle');
      await screen.findByRole('heading', { name: 'We could not book this ride' });
      expect(screen.queryByRole('link')).toBeNull();
    } finally {
      config.CALL_CENTER_PHONE = saved;
    }
  });

  test('the phone line is only on the could-not-book screen', async () => {
    requestWalkUp.mockRejectedValue(new RideRequestError('too many', { status: 429, code: 'TRY_LATER' }));
    renderModal();
    goToCheck();
    click('Call the shuttle');
    await screen.findByRole('heading', { name: 'Please wait' });
    expect(screen.queryByRole('link')).toBeNull();
  });

  test('a 429 shows Please wait', async () => {
    requestWalkUp.mockRejectedValue(new RideRequestError('too many', { status: 429, code: 'TRY_LATER' }));
    renderModal();
    goToCheck();
    click('Call the shuttle');
    expect(await screen.findByRole('heading', { name: 'Please wait' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
  });

  test('a closed shuttle is refused before anything is sent', async () => {
    verdict.mockResolvedValue('unavailable');
    renderModal();
    goToCheck();
    click('Call the shuttle');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Call the shuttle' })).toBeTruthy());
    expect(requestWalkUp).not.toHaveBeenCalled();
  });

  test('no answer, then Try again anyway reuses the same key', async () => {
    requestWalkUp
      .mockImplementationOnce(() => new Promise(() => {}))
      .mockResolvedValueOnce({ id: 'r1' });
    renderModal({ requestTimeoutMs: 30 });
    goToCheck();
    click('Call the shuttle');
    expect(await screen.findByText('We could not confirm your ride. Please check before you try again.')).toBeTruthy();
    click('Try again anyway');
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(requestWalkUp).toHaveBeenCalledTimes(2);
    expect(requestWalkUp.mock.calls[1][0].idempotencyKey).toBe(requestWalkUp.mock.calls[0][0].idempotencyKey);
  });

  test('a 409 without a code says still being booked and keeps the key', async () => {
    requestWalkUp
      .mockRejectedValueOnce(new RideRequestError('still', { status: 409, retryable: true }))
      .mockResolvedValueOnce({ id: 'r1' });
    renderModal();
    goToCheck();
    click('Call the shuttle');
    expect(await screen.findByText(/still being booked/)).toBeTruthy();
    click(/Try again anyway|Call the shuttle/);
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(requestWalkUp.mock.calls[1][0].idempotencyKey).toBe(requestWalkUp.mock.calls[0][0].idempotencyKey);
  });
});

describe('idle', () => {
  test('two minutes with no touch clears everything and closes', () => {
    vi.useFakeTimers();
    renderModal();
    goToNameScreen();
    fillName();
    act(() => {
      vi.advanceTimersByTime(WALKUP_IDLE_MS + 10);
    });
    expect(onClose).toHaveBeenCalled();
    expect(screen.getByRole('heading', { name: 'Call the shuttle' })).toBeTruthy();
    goToNameScreen();
    expect(screen.getByLabelText('First name').value).toBe('');
    expect(screen.getByLabelText('Phone number').value).toBe('');
  });

  test('a touch restarts the wait', () => {
    vi.useFakeTimers();
    renderModal();
    act(() => {
      vi.advanceTimersByTime(WALKUP_IDLE_MS - 1000);
    });
    fireEvent.pointerDown(document.body);
    act(() => {
      vi.advanceTimersByTime(WALKUP_IDLE_MS - 1000);
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  test('closing clears the typed values', () => {
    renderModal();
    goToNameScreen();
    fillName();
    click('Close');
    expect(onClose).toHaveBeenCalled();
    expect(store.uiStore.getKeyboardInputValue('walkUpFirst')).toBe('');
  });
});

describe('booking key and leftovers', () => {
  test('close and reopen after no answer reuses the key for the same details', async () => {
    requestWalkUp.mockImplementationOnce(() => new Promise(() => {})).mockResolvedValueOnce({ id: 'r1' });
    const view = renderModal({ requestTimeoutMs: 30 });
    goToCheck();
    click('Call the shuttle');
    await screen.findByText(/could not confirm your ride/);
    click('Close');
    view.rerender(<div />);
    cleanup();
    renderModal({ requestTimeoutMs: 30 });
    goToCheck();
    click('Call the shuttle');
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(requestWalkUp.mock.calls[1][0].idempotencyKey).toBe(requestWalkUp.mock.calls[0][0].idempotencyKey);
  });

  test('different details get a new key', async () => {
    requestWalkUp.mockRejectedValue(new RideRequestError('boom', { status: 503, retryable: true }));
    renderModal();
    goToCheck();
    click('Call the shuttle');
    await screen.findByText(/still being booked/);
    click('Change something');
    type('Last name', 'Perez');
    click('Next');
    click('Skip');
    click(/Try again anyway|Call the shuttle/);
    await waitFor(() => expect(requestWalkUp).toHaveBeenCalledTimes(2));
    expect(requestWalkUp.mock.calls[1][0].idempotencyKey).not.toBe(requestWalkUp.mock.calls[0][0].idempotencyKey);
  });

  test('a definitive refusal clears the key', async () => {
    requestWalkUp
      .mockRejectedValueOnce(new RideRequestError('x', { status: 400 }))
      .mockResolvedValueOnce({ id: 'r1' });
    renderModal();
    goToCheck();
    click('Call the shuttle');
    await screen.findByRole('heading', { name: 'We could not book this ride' });
    click('Try again');
    click('Next');
    click('Skip');
    click('Call the shuttle');
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(requestWalkUp.mock.calls[1][0].idempotencyKey).not.toBe(requestWalkUp.mock.calls[0][0].idempotencyKey);
  });

  test('a generic failure keeps the key', async () => {
    requestWalkUp
      .mockRejectedValueOnce(new RideRequestError('x', { status: 418 }))
      .mockResolvedValueOnce({ id: 'r1' });
    renderModal();
    goToCheck();
    click('Call the shuttle');
    await screen.findByRole('heading', { name: 'Something went wrong' });
    click('Try again');
    click('Call the shuttle');
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(requestWalkUp.mock.calls[1][0].idempotencyKey).toBe(requestWalkUp.mock.calls[0][0].idempotencyKey);
  });

  test('I have a PIN wipes what was typed, including the keyboard store', () => {
    renderModal();
    goToNameScreen();
    fillName();
    expect(store.uiStore.getKeyboardInputValue('walkUpPhone')).toBe('7165550123');
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    click('I have a PIN');
    expect(onChoosePin).toHaveBeenCalled();
    expect(store.uiStore.getKeyboardInputValue('walkUpFirst')).toBe('');
    expect(store.uiStore.getKeyboardInputValue('walkUpPhone')).toBe('');
  });
});
