import { useEffect, useRef, useState } from 'react';
import {
  Box, Button, Flex, Heading, IconButton, Input, Text, VStack
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
      {hint && <Text id={hintId} fontSize="md" mt={1}>{hint}</Text>}
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
  const intentKeyRef = useRef(null);
  const intentSigRef = useRef(null);
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
    intentKeyRef.current = null;
    intentSigRef.current = null;
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

  const showFailure = e => {
    intentKeyRef.current = null;
    intentSigRef.current = null;
    setRetryAnyway(false);
    setNotice(null);
    if (GATE_REFUSAL_CODES.includes(e?.code) && e.message) {
      setGateText(e.message);
      setStep('gate');
    } else if (e?.status === 429 || e?.code === 'TRY_LATER') {
      setProblem('wait');
      setStep('problem');
    } else if (e?.status === 400) {
      setProblem('couldNot');
      setStep('problem');
    } else {
      setProblem('error');
      setStep('problem');
    }
  };

  const finishBooked = () => {
    const hasEmail = Boolean(values.email.trim());
    intentKeyRef.current = null;
    intentSigRef.current = null;
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
      const signature = JSON.stringify({ ...request, language: undefined });
      if (!intentKeyRef.current || intentSigRef.current !== signature) {
        intentKeyRef.current = uuidv4();
        intentSigRef.current = signature;
      }
      request.idempotencyKey = intentKeyRef.current;

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
        top: `${kioskBottomHeight + headerHeight + 20}px`,
        left: '50%',
        transform: 'translate(-50%, -50%)',
        h: '620px',
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
    <Heading as="h2" size="lg" ref={headingRef} tabIndex={-1} mb={3} outline="none">
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
              <ActionButton onClick={onChoosePin} data-test-id="walkup-use-pin">{t('walkUp.havePin')}</ActionButton>
              <ActionButton variant="ghost" onClick={closeAll} data-test-id="walkup-back">{t('walkUp.back')}</ActionButton>
            </VStack>
          </>
        );
      case 'name':
        return (
          <form
            style={{ width: '100%' }}
            noValidate
            onSubmit={e => { e.preventDefault(); if (checkName()) setStep('app'); }}
          >
            {heading}
            <Text fontSize="20px" mb={4}>{t('walkUp.nameHint')}</Text>
            <Field label={t('walkUp.firstName')} error={errors.first} {...fieldProps('first', { autoComplete: 'off' })} />
            <Field label={t('walkUp.lastName')} error={errors.last} {...fieldProps('last')} />
            <Field label={t('walkUp.phone')} hint={t('walkUp.phoneHint')} error={errors.phone} {...fieldProps('phone')} />
            <VStack spacing={4} w="100%">
              <ActionButton primary type="submit" data-test-id="walkup-next">{t('walkUp.next')}</ActionButton>
              <ActionButton onClick={() => setStep('choose')} data-test-id="walkup-back">{t('walkUp.back')}</ActionButton>
            </VStack>
          </form>
        );
      case 'app':
        return (
          <form
            style={{ width: '100%' }}
            noValidate
            onSubmit={e => { e.preventDefault(); if (checkEmail()) goCheck(); }}
          >
            {heading}
            <Text fontSize="20px" mb={4}>{t('walkUp.appText')}</Text>
            <Field label={t('walkUp.email')} hint={t('walkUp.emailConsent')} error={errors.email} {...fieldProps('email')} />
            <VStack spacing={4} w="100%">
              <ActionButton primary type="submit" data-test-id="walkup-next">{t('walkUp.next')}</ActionButton>
              <ActionButton
                onClick={() => { setField('email', ''); if (usesKeyboardStore) { setKeyboardActiveInput(KEYBOARD_NAMES.email); setKeyboardInputValue(''); } setErrors({}); goCheck(); }}
                data-test-id="walkup-skip"
              >{t('walkUp.skip')}</ActionButton>
              <ActionButton onClick={() => { setErrors({}); setStep('name'); }} data-test-id="walkup-back">{t('walkUp.back')}</ActionButton>
            </VStack>
          </form>
        );
      case 'check':
      case 'calling': {
        const calling = step === 'calling';
        const email = values.email.trim();
        return (
          <Box w="100%">
            {heading}
            <VStack align="stretch" spacing={2} fontSize="20px" mb={4}>
              <Text>{t('walkUp.rowPickup', { place: placeText })}</Text>
              <Text>{t('walkUp.rowGoingTo', { place: destination?.title || '' })}</Text>
              <Text>{t('walkUp.rowName', { name: `${values.first.trim()} ${values.last.trim()}` })}</Text>
              <Text>{t('walkUp.rowPhone', { phone: formatPhone(values.phone) })}</Text>
              <Text>{email ? t('walkUp.rowAppSend', { email }) : t('walkUp.rowAppNo')}</Text>
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
            <Text role="alert" fontSize="20px" mb={6}>{t(`walkUp.${text}`)}</Text>
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
        role="dialog"
        aria-modal="true"
        aria-label={titles[step]}
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
          top={4}
          right={4}
          variant="ghost"
          minW={isTabletKiosk ? '56px' : '64px'}
          minH={isTabletKiosk ? '56px' : '64px'}
          data-test-id="walkup-close"
        />
        <Box w="100%" maxW="560px" m="auto" mt={isTabletKiosk ? 'auto' : 0}>
          {body()}
        </Box>
      </Flex>
    </>
  );
});

export default WalkUpBookingModal;
