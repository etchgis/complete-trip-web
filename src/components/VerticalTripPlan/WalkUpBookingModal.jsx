import { useEffect, useRef, useState } from 'react';
import {
  Box, Button, Flex, Heading, IconButton, Input, Link, Text, VStack
} from '@chakra-ui/react';
import { CloseIcon, WarningIcon } from '@chakra-ui/icons';
import { observer } from 'mobx-react-lite';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '../../context/RootStore';
import useTranslation from '../../models/useTranslation';
import rides, { GATE_REFUSAL_CODES } from '../../services/transport/rides';
import { DEMO_TIMEOUT_MS } from '../../services/transport/demoRides';
import { getCurrentKioskConfig } from '../../models/kiosk-definitions';
import { TABLET_SCREEN_HEIGHT, isTabletKiosk, kioskHasOwnKeyboard } from '../../models/kiosk-layout';
import { isWalkUpDemoActive } from '../../models/kiosk-walkup';
import { checkServiceAvailability } from '../../hooks/useServiceAvailability';
import config from '../../config';
import DemoBanner, { DEMO_BANNER_HEIGHT } from './DemoBanner';

// Two minutes with no touch on any of these screens clears what was typed and
// closes the form, so the next person at a shared device starts fresh.
export const WALKUP_IDLE_MS = 120000;
export const WALKUP_REQUEST_TIMEOUT_MS = 20000;

const NO_ANSWER = Symbol('walk-up request did not answer');

// How long a booking key is reused for the same rider and trip.
export const BOOKING_KEY_MAX_AGE_MS = 10 * 60 * 1000;

// The key of the last booking whose outcome is not known. It lives outside the
// form on purpose: closing or idling the form wipes what was typed, but a rider
// who comes back and books the same trip must still get the same key, or a ride
// that was booked but never confirmed would be booked a second time. It holds a
// one-way digest of the details, never the name or the phone number.
let pendingBooking = null;

export const clearPendingBooking = () => {
  pendingBooking = null;
};

// A small one-way digest (cyrb53). It is not for security; it only lets us tell
// whether two bookings are the same without keeping what was typed.
const digest = text => {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
};

const EMPTY = { first: '', last: '', phone: '', email: '' };

// The names the on-screen keyboard stores each field under.
const KEYBOARD_NAMES = {
  first: 'walkUpFirst',
  last: 'walkUpLast',
  phone: 'walkUpPhone',
  email: 'walkUpEmail',
};

export const phoneDigits = value => String(value || '').replace(/\D/g, '').slice(0, 10);

// Shows 716 as 716, 716555 as (716) 555 and a full number as (716) 555-0123.
export const formatPhone = digits => {
  const d = phoneDigits(digits);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
};

export const isEmailShaped = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const buttonSize = {
  minH: isTabletKiosk ? '56px' : '64px',
  fontSize: '20px',
  w: '100%',
  whiteSpace: 'normal',
  h: 'auto',
  py: 2,
};

// A check-screen row: the part before the first colon is bold.
const Row = ({ text }) => {
  const i = text.indexOf(': ');
  if (i < 0) return <Text>{text}</Text>;
  return (
    <Text>
      <Text as="span" fontWeight="bold">{text.slice(0, i + 1)}</Text>
      {text.slice(i + 1)}
    </Text>
  );
};

const ActionButton = ({ primary, ...props }) => (
  <Button variant={primary ? 'brand' : 'outline'} type="button" {...buttonSize} {...props} />
);

// A labeled text box with a hint and an error that screen readers can reach.
const Field = ({ id, label, hint, error, inputRef, ...inputProps }) => {
  const { t } = useTranslation();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ');
  return (
    <Box w="100%" mb={4}>
      <Text as="label" htmlFor={id} display="block" fontSize="20px" fontWeight="bold" mb={1}>
        {label}
      </Text>
      <Input
        id={id}
        ref={inputRef}
        size="lg"
        fontSize="20px"
        minH={isTabletKiosk ? '56px' : '64px'}
        isInvalid={Boolean(error)}
        aria-describedby={describedBy || undefined}
        autoComplete="off"
        {...inputProps}
      />
      {hint && <Text id={hintId} fontSize="18px" color="gray.700" mt={1}>{hint}</Text>}
      <Box id={errorId} role="alert" minH={error ? undefined : 0}>
        {error && (
          <Text color="red.600" fontSize="lg" fontWeight="bold" mt={1}>
            <WarningIcon mr={2} aria-label={t('walkUp.error')} />
            {error}
          </Text>
        )}
      </Box>
    </Box>
  );
};

/**
 * Walk-up booking at a shared kiosk: choose how to book, then type a name and
 * phone number, check the ride and call the shuttle. Nothing typed is kept once
 * the form closes.
 */
const WalkUpBookingModal = observer(({
  isOpen,
  onClose,
  onSuccess,
  onChoosePin,
  // Kept so the caller can pass the same layout numbers it gives the PIN form.
  // eslint-disable-next-line no-unused-vars
  kioskBottomHeight = 255,
  headerHeight = 60,
  requestTimeoutMs,
}) => {
  const timeoutMs = requestTimeoutMs ?? (isWalkUpDemoActive() ? DEMO_TIMEOUT_MS : WALKUP_REQUEST_TIMEOUT_MS);
  const { ux, ui, activeInput, setKeyboardActiveInput, setKeyboardInputValue, getKeyboardInputValue, onScreenKeyboardInput, setKeyboardType } = useStore().uiStore;
  const { trip } = useStore();
  const { t } = useTranslation();

  const [step, setStep] = useState('choose');
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  // A message shown on the check screen: no answer, still booking, hours.
  const [notice, setNotice] = useState(null);
  const [retryAnyway, setRetryAnyway] = useState(false);
  const [problem, setProblem] = useState('error');
  const [gateText, setGateText] = useState('');

  const headingRef = useRef(null);
  const fieldRefs = { first: useRef(null), last: useRef(null), phone: useRef(null), email: useRef(null) };
  const sessionRef = useRef(0);
  const dialogRef = useRef(null);
  const sendingRef = useRef(false);
  const idleTimerRef = useRef(null);

  const usesKeyboardStore = ux === 'kiosk' && !kioskHasOwnKeyboard;

  const clearKeyboardFields = () => {
    Object.values(KEYBOARD_NAMES).forEach(name => {
      setKeyboardActiveInput(name);
      setKeyboardInputValue('');
    });
  };

  const reset = () => {
    sessionRef.current += 1;
    setStep('choose');
    setValues(EMPTY);
    setErrors({});
    setNotice(null);
    setRetryAnyway(false);
    setGateText('');
    setProblem('error');
    clearKeyboardFields();
    setKeyboardActiveInput('transitSearch');
  };

  const closeAll = () => {
    reset();
    setKeyboardType('default');
    onClose();
  };

  // Each time the form opens it starts clean on the first screen.
  useEffect(() => {
    if (isOpen) reset();
    else setKeyboardType('default');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // On the large kiosk the on-screen keyboard writes into the store; copy the
  // four fields from there.
  useEffect(() => {
    if (!isOpen || !usesKeyboardStore) return;
    const phoneRaw = getKeyboardInputValue(KEYBOARD_NAMES.phone) || '';
    const phone = phoneDigits(phoneRaw);
    setValues({
      first: getKeyboardInputValue(KEYBOARD_NAMES.first) || '',
      last: getKeyboardInputValue(KEYBOARD_NAMES.last) || '',
      phone,
      email: getKeyboardInputValue(KEYBOARD_NAMES.email) || '',
    });
    // The keyboard can type past 10 digits; trim what it holds too.
    if (phone !== phoneRaw && activeInput === KEYBOARD_NAMES.phone) {
      setKeyboardInputValue(phone);
    }
  }, [onScreenKeyboardInput, isOpen, usesKeyboardStore]);

  // Point the on-screen keyboard at the first field of the screen.
  useEffect(() => {
    if (!isOpen || !usesKeyboardStore) return;
    if (step === 'name') {
      setKeyboardType('default');
      setKeyboardActiveInput(KEYBOARD_NAMES.first);
    } else if (step === 'app') {
      setKeyboardType('default');
      setKeyboardActiveInput(KEYBOARD_NAMES.email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, isOpen]);

  // The heading gets focus on every screen so a screen reader says where the
  // rider is.
  useEffect(() => {
    if (isOpen && headingRef.current) headingRef.current.focus();
  }, [step, isOpen]);

  // Keep Tab inside the form while it is open.
  useEffect(() => {
    if (!isOpen) return undefined;
    const trap = e => {
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const items = Array.from(
        dialogRef.current.querySelectorAll('button, input, a[href], [tabindex]')
      ).filter(el => !el.disabled && el.tabIndex >= 0);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      if (!dialogRef.current.contains(current)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && (current === first || !items.includes(current))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && current === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [isOpen]);

  // Idle timer.
  useEffect(() => {
    if (!isOpen) return undefined;
    const restart = () => {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(closeAll, WALKUP_IDLE_MS);
    };
    restart();
    const events = ['pointerdown', 'mousedown', 'touchstart', 'keydown'];
    events.forEach(name => document.addEventListener(name, restart, true));
    return () => {
      clearTimeout(idleTimerRef.current);
      events.forEach(name => document.removeEventListener(name, restart, true));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const setField = (name, value) => {
    setValues(v => ({ ...v, [name]: value }));
    setErrors(e => ({ ...e, [name]: undefined }));
  };

  // Props that tie a text box to either the tablet's own keyboard or the
  // on-screen keyboard.
  const fieldProps = (name, extra = {}) => {
    const kbName = KEYBOARD_NAMES[name];
    const isPhone = name === 'phone';
    return {
      id: `walkup-${name}`,
      inputRef: fieldRefs[name],
      value: isPhone ? formatPhone(values.phone) : values[name],
      inputMode: isPhone ? 'numeric' : name === 'email' ? 'email' : 'text',
      type: isPhone ? 'tel' : name === 'email' ? 'email' : 'text',
      maxLength: isPhone ? 14 : 60,
      onFocus: () => {
        if (usesKeyboardStore) {
          setKeyboardType(isPhone ? 'numeric' : 'default');
          setKeyboardActiveInput(kbName);
        }
      },
      onChange: e => {
        const value = isPhone ? phoneDigits(e.target.value) : e.target.value;
        setField(name, value);
        if (usesKeyboardStore) {
          setKeyboardActiveInput(kbName);
          setKeyboardInputValue(value);
        }
      },
      ...extra,
    };
  };

  const checkName = () => {
    const next = {};
    if (!values.first.trim()) next.first = t('walkUp.firstNameError');
    if (!values.last.trim()) next.last = t('walkUp.lastNameError');
    if (phoneDigits(values.phone).length !== 10) next.phone = t('walkUp.phoneError');
    setErrors(next);
    const firstBad = ['first', 'last', 'phone'].find(k => next[k]);
    if (firstBad) {
      fieldRefs[firstBad].current?.focus();
      return false;
    }
    return true;
  };

  const checkEmail = () => {
    const email = values.email.trim();
    if (email && !isEmailShaped(email)) {
      setErrors({ email: t('walkUp.emailError') });
      fieldRefs.email.current?.focus();
      return false;
    }
    setErrors({});
    return true;
  };

  const goCheck = () => {
    setNotice(null);
    setStep('check');
  };

  // The steps are plain containers, not forms, because the trip plan around this
  // modal is already inside a form, and a submit here would submit that one and
  // reload the kiosk page. Next and the Enter key call these instead.
  const submitName = () => {
    if (checkName()) setStep('app');
  };
  const submitEmail = () => {
    if (checkEmail()) goCheck();
  };

  // The booking key is dropped only when the server definitely refused the
  // ride. Any other failure may have booked it, so the key stays for a retry.
  const showFailure = e => {
    setRetryAnyway(false);
    setNotice(null);
    if (GATE_REFUSAL_CODES.includes(e?.code) && e.message) {
      clearPendingBooking();
      setGateText(e.message);
      setStep('gate');
    } else if (e?.status === 429 || e?.code === 'TRY_LATER') {
      clearPendingBooking();
      setProblem('wait');
      setStep('problem');
    } else if (e?.status === 400) {
      clearPendingBooking();
      setProblem('couldNot');
      setStep('problem');
    } else {
      setProblem('error');
      setStep('problem');
    }
  };

  const finishBooked = () => {
    const hasEmail = Boolean(values.email.trim());
    clearPendingBooking();
    reset();
    setKeyboardType('default');
    onSuccess({ hasEmail });
  };

  const callShuttle = async () => {
    if (sendingRef.current) return;
    sendingRef.current = true;
    const email = values.email.trim();
    const phone = `+1${phoneDigits(values.phone)}`;
    const session = sessionRef.current;
    setNotice(null);
    setStep('calling');
    try {
      // The rider may have spent minutes on this form, so the hours are
      // checked again, and only a clear "running" lets the ride through.
      const verdict = await checkServiceAvailability(config.HDS_SERVICE_ID);
      if (sessionRef.current !== session) return;
      if (verdict !== 'available') {
        setStep('check');
        setNotice(t(verdict === 'unavailable' ? 'routeList.shuttleNotAvailableTimeFrame' : 'tripWizard.shuttleUnconfirmed'));
        return;
      }

      const destination = trip.request.destination;
      const dropoff = {
        title: destination.title,
        address: destination.address,
        coordinates: [destination.point.lng, destination.point.lat],
      };
      const language = ui?.language || 'en';
      const request = {
        firstName: values.first.trim(),
        lastName: values.last.trim(),
        phone,
        email: email || undefined,
        dropoff,
        passengers: 1,
        language,
      };
      // One key per booking. A retry of the same booking reuses it; a change to
      // who or where is a different booking and gets a new one.
      const sig = digest(JSON.stringify([
        request.firstName, request.lastName, request.phone, request.dropoff,
      ]));
      const now = Date.now();
      if (!pendingBooking || pendingBooking.sig !== sig || now - pendingBooking.ts > BOOKING_KEY_MAX_AGE_MS) {
        pendingBooking = { sig, key: uuidv4(), ts: now };
      }
      request.idempotencyKey = pendingBooking.key;

      let timedOut = false;
      let timer;
      const requested = rides.requestWalkUp(request);
      // A reply that comes after we stopped waiting still says what became of
      // the ride.
      requested.then(
        () => {
          if (!timedOut || sessionRef.current !== session) return;
          finishBooked();
        },
        e => {
          if (!timedOut || sessionRef.current !== session) return;
          if (e?.retryable) {
            setNotice(t('walkUp.stillBooking'));
            return;
          }
          showFailure(e);
        }
      );
      try {
        await Promise.race([
          requested,
          new Promise((resolve, reject) => {
            timer = setTimeout(() => reject(NO_ANSWER), timeoutMs);
          }),
        ]);
        if (sessionRef.current !== session) return;
        finishBooked();
      } catch (e) {
        if (sessionRef.current !== session) return;
        if (e === NO_ANSWER) {
          timedOut = true;
          setRetryAnyway(true);
          setNotice(t('walkUp.noAnswer'));
          setStep('check');
        } else if (e?.retryable) {
          setRetryAnyway(true);
          setNotice(t('walkUp.stillBooking'));
          setStep('check');
        } else {
          showFailure(e);
        }
      } finally {
        clearTimeout(timer);
      }
    } finally {
      sendingRef.current = false;
    }
  };

  if (!isOpen) return null;

  const kioskConfig = getCurrentKioskConfig();
  const helpPhone = config.CALL_CENTER_PHONE;
  const destination = trip?.request?.destination;
  const placeText = [kioskConfig?.displayName, kioskConfig?.pickupDescription].filter(Boolean).join(', ');

  const tabletProps = isTabletKiosk
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        transform: 'none',
        h: TABLET_SCREEN_HEIGHT,
        w: '100%',
        paddingX: '24px',
        paddingTop: `${56 + (isWalkUpDemoActive() ? DEMO_BANNER_HEIGHT : 0)}px`,
        paddingBottom: '16px',
        alignItems: 'flex-start',
        overflowY: 'auto',
        borderRadius: 0,
      }
    : {
        position: 'absolute',
        // Taller than the PIN form so every screen fits without scrolling; it
        // starts just under the header and the demo banner.
        top: `${headerHeight + 10}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        h: '700px',
        w: '700px',
        paddingX: '40px',
        paddingTop: '70px',
        paddingBottom: '30px',
        overflowY: 'auto',
        alignItems: 'flex-start',
        borderRadius: 'md',
      };

  const titles = {
    choose: t('walkUp.chooseTitle'),
    name: t('walkUp.nameTitle'),
    app: t('walkUp.appTitle'),
    check: t('walkUp.checkTitle'),
    calling: t('walkUp.checkTitle'),
    gate: t('walkUp.cannotComeTitle'),
    problem: t(`walkUp.${{ couldNot: 'couldNotBookTitle', wait: 'waitTitle', error: 'errorTitle' }[problem]}`),
  };

  const heading = (
    <Heading as="h2" id="walkup-heading" size="lg" ref={headingRef} tabIndex={-1} mb={3} sx={{ '&:focus, &:focus-visible': { outline: 'none !important', boxShadow: 'none !important' } }}>
      {titles[step]}
    </Heading>
  );

  const startOver = () => {
    reset();
  };

  const body = () => {
    switch (step) {
      case 'choose':
        return (
          <>
            {heading}
            <Text fontSize="20px" mb={4}>{t('walkUp.chooseHint')}</Text>
            <VStack spacing={4} w="100%">
              <ActionButton primary onClick={() => setStep('name')} data-test-id="walkup-use-name">
                <Box>
                  <Text>{t('walkUp.useNamePhone')}</Text>
                  <Text fontSize="md" fontWeight="normal">{t('walkUp.noAccountNeeded')}</Text>
                </Box>
              </ActionButton>
              <ActionButton onClick={() => { reset(); onChoosePin(); }} data-test-id="walkup-use-pin">{t('walkUp.havePin')}</ActionButton>
              <ActionButton variant="ghost" onClick={closeAll} data-test-id="walkup-back">{t('walkUp.back')}</ActionButton>
            </VStack>
          </>
        );
      case 'name':
        return (
          <Box
            w="100%"
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submitName(); } }}
          >
            {heading}
            <Text fontSize="20px" mb={4}>{t('walkUp.nameHint')}</Text>
            <Field label={t('walkUp.firstName')} error={errors.first} {...fieldProps('first', { autoComplete: 'off' })} />
            <Field label={t('walkUp.lastName')} error={errors.last} {...fieldProps('last')} />
            <Field label={t('walkUp.phone')} hint={t('walkUp.phoneHint')} error={errors.phone} {...fieldProps('phone')} />
            <VStack spacing={4} w="100%">
              <ActionButton primary onClick={submitName} data-test-id="walkup-next">{t('walkUp.next')}</ActionButton>
              <ActionButton onClick={() => setStep('choose')} data-test-id="walkup-back">{t('walkUp.back')}</ActionButton>
            </VStack>
          </Box>
        );
      case 'app':
        return (
          <Box
            w="100%"
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); submitEmail(); } }}
          >
            {heading}
            <Text fontSize="20px" mb={4}>{t('walkUp.appText')}</Text>
            <Field label={t('walkUp.email')} hint={t('walkUp.emailConsent')} error={errors.email} {...fieldProps('email')} />
            <VStack spacing={4} w="100%">
              <ActionButton primary onClick={submitEmail} data-test-id="walkup-next">{t('walkUp.next')}</ActionButton>
              <ActionButton
                onClick={() => { setField('email', ''); if (usesKeyboardStore) { setKeyboardActiveInput(KEYBOARD_NAMES.email); setKeyboardInputValue(''); } setErrors({}); goCheck(); }}
                data-test-id="walkup-skip"
              >{t('walkUp.skip')}</ActionButton>
              <ActionButton onClick={() => { setErrors({}); setStep('name'); }} data-test-id="walkup-back">{t('walkUp.back')}</ActionButton>
            </VStack>
          </Box>
        );
      case 'check':
      case 'calling': {
        const calling = step === 'calling';
        const email = values.email.trim();
        return (
          <Box w="100%">
            {heading}
            <VStack align="stretch" spacing={2} fontSize="20px" mb={4}>
              <Row text={t('walkUp.rowPickup', { place: placeText })} />
              <Row text={t('walkUp.rowGoingTo', { place: destination?.title || '' })} />
              <Row text={t('walkUp.rowName', { name: `${values.first.trim()} ${values.last.trim()}` })} />
              <Row text={t('walkUp.rowPhone', { phone: formatPhone(values.phone) })} />
              <Row text={email ? t('walkUp.rowAppSend', { email }) : t('walkUp.rowAppNo')} />
            </VStack>
            <Text fontSize="20px" mb={4}>{t('walkUp.checkNote')}</Text>
            <Box role="alert" aria-live="assertive" mb={3}>
              {notice && (
                <Text color="red.600" fontSize="lg" fontWeight="bold">
                  <WarningIcon mr={2} aria-label={t('walkUp.error')} />
                  {notice}
                </Text>
              )}
            </Box>
            <Box role="status" aria-live="polite" fontSize="20px" fontWeight="bold" mb={3}>
              {calling ? t('walkUp.calling') : ''}
            </Box>
            <VStack spacing={4} w="100%">
              <ActionButton primary onClick={callShuttle} isDisabled={calling} isLoading={calling} data-test-id="walkup-call">
                {retryAnyway ? t('tripWizard.summonShuttleRetry') : t('walkUp.callShuttle')}
              </ActionButton>
              <ActionButton onClick={() => { setNotice(null); setStep('name'); }} isDisabled={calling} data-test-id="walkup-change">
                {t('walkUp.changeSomething')}
              </ActionButton>
            </VStack>
          </Box>
        );
      }
      case 'gate':
        return (
          <Box w="100%">
            {heading}
            <Text role="alert" fontSize="20px" mb={6}>{gateText}</Text>
            <VStack spacing={4} w="100%">
              <ActionButton primary onClick={closeAll} data-test-id="walkup-other-ways">{t('walkUp.seeOtherWays')}</ActionButton>
              <ActionButton onClick={startOver} data-test-id="walkup-start-over">{t('walkUp.startOver')}</ActionButton>
            </VStack>
          </Box>
        );
      case 'problem': {
        const text = { couldNot: 'couldNotBookText', wait: 'waitText', error: 'errorText' }[problem];
        return (
          <Box w="100%">
            {heading}
            <Box role="alert" mb={6}>
              <Text fontSize="20px">{t(`walkUp.${text}`)}</Text>
              {problem === 'couldNot' && helpPhone?.display && (
                <Text fontSize="20px" mt={3}>
                  {t('walkUp.helpPhone')}{' '}
                  <Link
                    href={`tel:${helpPhone.tel}`}
                    aria-label={t('walkUp.helpPhoneLabel', { phone: helpPhone.display })}
                    color="blue.700"
                    fontWeight="bold"
                    textDecoration="underline"
                    display="inline-block"
                    minH={isTabletKiosk ? '56px' : '64px'}
                    lineHeight={isTabletKiosk ? '56px' : '64px'}
                    data-test-id="walkup-help-phone"
                  >
                    {helpPhone.display}
                  </Link>
                </Text>
              )}
            </Box>
            <VStack spacing={4} w="100%">
              {problem !== 'wait' && (
                <ActionButton primary onClick={() => (problem === 'couldNot' ? setStep('name') : goCheck())} data-test-id="walkup-try-again">
                  {t('walkUp.tryAgain')}
                </ActionButton>
              )}
              <ActionButton primary={problem === 'wait'} onClick={startOver} data-test-id="walkup-start-over">{t('walkUp.startOver')}</ActionButton>
            </VStack>
          </Box>
        );
      }
      default:
        return null;
    }
  };

  return (
    <>
      <DemoBanner />
      <Flex
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="walkup-heading"
        background="white"
        zIndex={3}
        boxShadow="md"
        {...tabletProps}
      >
        <IconButton
          onClick={closeAll}
          aria-label={t('global.close')}
          icon={<CloseIcon />}
          pos="absolute"
          top={isWalkUpDemoActive() ? `${DEMO_BANNER_HEIGHT + 16}px` : 4}
          right={4}
          variant="ghost"
          minW={isTabletKiosk ? '56px' : '64px'}
          minH={isTabletKiosk ? '56px' : '64px'}
          data-test-id="walkup-close"
        />
        <Box w="100%" maxW="560px" mx="auto" mt={isTabletKiosk ? 6 : 0}>
          {body()}
        </Box>
      </Flex>
    </>
  );
});

export default WalkUpBookingModal;
