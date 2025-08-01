import {
  Box,
  Button,
  Center,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Heading,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  PinInput,
  PinInputField,
  Radio,
  RadioGroup,
  Stack,
  Text,
  VStack,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  ViewIcon,
  ViewOffIcon,
  WarningTwoIcon,
} from '@chakra-ui/icons';
import { useEffect, useState } from 'react';

import { VerifyPin } from '../Shared/VerifyPin';
import { authentication } from '../../services/transport';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../context/RootStore';
import useTranslation from '../../models/useTranslation';
import { validators } from '../../utils/validators';
import { use } from 'chai';
// import PinInput from './PinInput';

const { hasLowerCase, hasNumber, hasUpperCase } = validators;

export const LoginRegister = observer(({ hideModal, verify, onVerificationComplete }) => {
  const {
    loggedIn,
    auth: authLogin,
    error: authError,
    setError: authSetError,
    verifyUser,
  } = useStore().authentication;

  const [stagedUser, setStagedUser] = useState({});
  const [activeView, setActiveView] = useState(verify && verify.identity !== undefined ? 'reset' : 'init');
  const [loginMessage, setLoginMessage] = useState('');
  const [forgotOptions, setForgotOptions] = useState({});

  useEffect(() => {
    if (loggedIn) hideModal();
  }, [loggedIn, hideModal]);

  useEffect(() => {
    if (!verify) return
    const forgotOptions = {
      email: verify.identity,
      code: verify.code,
      method: 'email',
    }
    setForgotOptions(forgotOptions)
  }, [verify])

  const views = [
    {
      id: 'init',
      view: <Init setActiveView={setActiveView} hideModal={hideModal}></Init>,
    },
    {
      id: 'login',
      view: (
        <CreateAccountOrLogin
          setActiveView={setActiveView}
          isLogin={true}
          authLogin={authLogin}
          error={authError}
          setError={authSetError}
          loginMessage={loginMessage}
          setLoginMessage={setLoginMessage}
          setStagedUser={setStagedUser}
          verifyUser={verifyUser}
        ></CreateAccountOrLogin>
      ),
    },
    {
      id: 'create',
      view: (
        <CreateAccountOrLogin
          setActiveView={setActiveView}
          isLogin={false}
          authLogin={authLogin}
          error={authError}
          setError={authSetError}
          loginMessage={loginMessage}
          setLoginMessage={setLoginMessage}
          setStagedUser={setStagedUser}
          verifyUser={verifyUser}
        ></CreateAccountOrLogin>
      ),
    },
    {
      id: 'verify',
      view: (
        <VerifyPin
          channel={'email'}
          stagedUser={stagedUser}
          setActiveView={setActiveView}
          setLoginMessage={setLoginMessage}
        ></VerifyPin>
      ),
    },
    {
      id: 'forgot',
      view: (
        <ForgotPasswordView
          setActiveView={setActiveView}
          hideModal={hideModal}
          setForgotOptions={setForgotOptions}
        ></ForgotPasswordView>
      ),
    },
    {
      id: 'reset',
      view: (
        <ResetPasswordView
          setActiveView={setActiveView}
          hideModal={hideModal}
          options={forgotOptions}
        ></ResetPasswordView>
      ),
    },
    {
      id: 'facebook',
      view: <Box>Facebook</Box>,
    },
    {
      id: 'google',
      view: <Box>Google</Box>,
    },
  ];

  // FORMS STATE

  return (
    <Flex
      id="login-card"
      justifyContent={'center'}
      alignItems="center"
      flex={1}
    >
      <Stack
        spacing={8}
        w="100%"
        id="stack"
        bg={useColorModeValue('white', 'gray.700')}
      // boxShadow={'lg'}
      >
        <Center bg={useColorModeValue('white', 'white')} p={8}>
          <Image
            src={'/buffalo_logo_full.png'}
            h={'200px'}
            alt="Buffalo Access"
          />
        </Center>
        <Stack spacing={4} p={8}>
          {views.find(v => v.id === activeView).view}
        </Stack>
      </Stack>
    </Flex>
  );
});

const Init = ({ setActiveView, hideModal }) => {
  let { colorMode } = useColorMode();
  const { t } = useTranslation();
  return (
    <Stack spacing={4}>
      <Box p={10}></Box>
      <Button
        variant={'brand'}
        onClick={() => {
          setActiveView('login');
        }}
      >
        {t('loginWizard.login')}
      </Button>
      <Button
        variant={'brand-outline'}
        onClick={() => {
          setActiveView('create');
        }}
      >
        {t('loginWizard.signUp')}
      </Button>
      <Button
        variant="link"
        color={colorMode === 'light' ? 'brandDark' : 'white'}
        fontWeight={600}
        onClick={() => {
          hideModal();
          setTimeout(() => {
            setActiveView('login');
          }, 500);
        }}
      >
        {t('loginWizard.continueGuest')}
      </Button>
    </Stack>
  );
};

const CreateAccountOrLogin = ({
  isLogin,
  setActiveView,
  error,
  setError,
  loginMessage,
  setLoginMessage,
  setStagedUser,
  verifyUser,
}) => {
  const { colorMode } = useColorMode();
  const [showPassword, setShowPassword] = useState(false);
  const [showLogin, setShowLogin] = useState(isLogin);
  const [loginError, setLoginHasError] = useState(false);
  const [hideTerms, setHideTerms] = useState(true);

  const { ui } = useStore().uiStore;
  const { auth } = useStore().authentication;
  const { t } = useTranslation();

  useEffect(() => {
    if (error) {
      if (error === 'Conflict')
        setLoginMessage(t('errors.conflict', { email: error.email }));
      console.log({ error });
      return setLoginHasError(true);
    }
    setLoginHasError(false);
    //eslint-disable-next-line
  }, [error]);

  // FORM STATES
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRequirements, setPasswordRequirements] = useState([false, false, false, false]);
  const [isValid, setIsValid] = useState(false);
  const [terms, setTerms] = useState(false);
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    setLoginHasError(false);
    setError(null);
    //eslint-disable-next-line
  }, [firstName, lastName, password, email]);

  useEffect(() => {
    let pr = [true, true, true, true];
    if (!validators.hasLengthGreaterThan(password, 7)) {
      pr[0] = false;
    }
    if (!validators.hasUpperCase(password)) {
      pr[1] = false;
    }
    if (!validators.hasLowerCase(password)) {
      pr[2] = false;
    }
    if (!validators.hasNumber(password)) {
      pr[3] = false;
    }
    setPasswordRequirements(pr);
  }, [password]);

  useEffect(() => {
    const valid =
      firstName.length > 0 &&
      lastName.length > 0 &&
      validators.isEmail(email) &&
      passwordRequirements.indexOf(false) === -1 &&
      terms;
    setIsValid(valid);
  }, [firstName, lastName, email, passwordRequirements, terms]);

  return (
    <>
      {hideTerms ? (
        <Stack
          spacing={4}
          as="form"
          onSubmit={async e => {
            e.preventDefault();
            if (showLogin) {
              const user = await auth(email, password);
              if (!user || user.error) {
                setLoginHasError(true);
                return;
              }
            } else {
              //stage user
              setStagedUser({
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password,
                language: ui?.language || 'en',
                terms: terms,
                consent: consent,
              });
              //send verify email to twilio
              const verified = await verifyUser('email', email);
              if (!verified || verified.error) return;
              console.log({ verified });
              setActiveView('verify');
            }
          }}
        >
          {!showLogin ? (
            <Box>
              <HStack>
                <FormControl id="firstName" isRequired>
                  <FormLabel>{t('global.firstName')}</FormLabel>
                  <Input
                    type="text"
                    onChange={e => setFirstName(e.target.value)}
                    value={firstName || ''}
                  />
                </FormControl>
                <FormControl id="lastName" isRequired>
                  <FormLabel>{t('global.lastName')}</FormLabel>
                  <Input
                    type="text"
                    onChange={e => setLastName(e.target.value)}
                    value={lastName || ''}
                  />
                </FormControl>
              </HStack>
            </Box>
          ) : (
            <>
              <Text>{loginMessage}</Text>
            </>
          )}
          {loginError && showLogin ? (
            <Box color="red.500">{t('errors.unknown')}</Box>
          ) : (
            ''
          )}
          <FormControl isRequired>
            <FormLabel>{t('global.emailAddress')}</FormLabel>
            <Input
              type="email"
              onChange={e => setEmail(e.target.value)}
              value={email || ''}
            />
          </FormControl>
          <FormControl id="password" isRequired>
            <FormLabel>{t('settingsPassword.password')}</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? 'text' : 'password'}
                onChange={e => setPassword(e.target.value)}
                value={password || ''}
                placeholder={t('settingsPassword.placeholder')}
              // pattern={
              //   '(?=[A-Za-z0-9]+$)^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,}).*$'
              // }
              />
              <InputRightElement h={'full'}>
                <Button
                  variant={'ghost'}
                  onClick={() => setShowPassword(showPassword => !showPassword)}
                >
                  {showPassword ? (
                    <ViewIcon aria-label={t('settingsPassword.hide')} />
                  ) : (
                    <ViewOffIcon aria-label={t('settingsPassword.show')} />
                  )}
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>
          {!showLogin ? (
            <Flex justifyContent={'space-around'}>
              <VStack
                spacing={0}
                color={password.length > 7 ? 'ariaGreenText' : 'red.500'}
              >
                <Text fontSize={'xl'} fontWeight="bold">
                  8+
                </Text>
                <Text fontSize="lg" fontWeight={'bold'}>
                  {t('settingsPassword.characters')}
                </Text>
                {password.length > 7 ? (
                  <CheckCircleIcon size="xs" />
                ) : (
                  <WarningTwoIcon size="xs" />
                )}
              </VStack>
              <VStack
                spacing={0}
                color={hasUpperCase(password) ? 'ariaGreenText' : 'red.500'}
              >
                <Text fontSize={'xl'} fontWeight="bold">
                  A-Z
                </Text>
                <Text>{t('settingsPassword.uppercase')}</Text>
                {hasUpperCase(password) ? (
                  <CheckCircleIcon size="xs" />
                ) : (
                  <WarningTwoIcon size="xs" />
                )}
              </VStack>
              <VStack
                spacing={0}
                color={hasLowerCase(password) ? 'ariaGreenText' : 'red.500'}
              >
                <Text fontSize={'xl'} fontWeight="bold">
                  a-z
                </Text>
                <Text color="ariaRedText">
                  {t('settingsPassword.lowercase')}
                </Text>
                {hasLowerCase(password) ? (
                  <CheckCircleIcon size="xs" />
                ) : (
                  <WarningTwoIcon size="xs" />
                )}
              </VStack>
              <VStack
                spacing={0}
                color={hasNumber(password) ? 'ariaGreenText' : 'red.500'}
              >
                <Text fontSize={'xl'} fontWeight="bold">
                  0-9
                </Text>
                <Text>{t('settingsPassword.number')}</Text>
                {hasNumber(password) ? (
                  <CheckCircleIcon size="xs" />
                ) : (
                  <WarningTwoIcon size="xs" />
                )}
              </VStack>
            </Flex>
          ) : null}
          {!showLogin ? (
            <FormControl isRequired>
              <Checkbox name="terms" isReadOnly={true} isChecked={terms}>
                {t('loginWizard.terms1')}{' '}
                <Button
                  variant={'link'}
                  onClick={() => setHideTerms(false)}
                  color="brand"
                  textDecoration={'underline'}
                >
                  {t('loginWizard.terms2')}
                </Button>
                .
              </Checkbox>
            </FormControl>
          ) : (
            ''
          )}
          {showLogin ? (
            <Box fontSize={'md'} mt={'2'} textAlign={'right'}>
              <Button
                color={colorMode === 'light' ? 'brandDark' : 'gray.400'}
                as="span"
                variant={'link'}
                onClick={() => setActiveView('forgot')}
                data-testid="forgot-password-link"
                tabIndex={0}
              >
                {t('loginWizard.forgotPassword')}
              </Button>
            </Box>
          ) : (
            ''
          )}
          <Button
            variant={'brand'}
            type="submit"
            mt={6}
            isDisabled={
              showLogin ? false : !showLogin && !isValid ? true : false
            }
          >
            {showLogin
              ? t('loginWizard.login')
              : 'CREATE'//t('loginWizard.createAccount')
            }
          </Button>
          <Center p={6}>
            <Text color={'gray.600'}>
              {showLogin
                ? t('loginWizard.noAccount')
                : t('loginWizard.haveAccount')}
            </Text>
            <Button
              color={colorMode === 'light' ? 'brandDark' : 'white'}
              as="span"
              variant={'link'}
              onClick={() => setShowLogin(!showLogin)}
              ml={2}
              tabIndex={0}
            >
              {showLogin
                ? t('loginWizard.createAccount')
                : t('loginWizard.login')}
            </Button>
          </Center>
          {/* <SocialLogins
          setActiveView={setActiveView}
        ></SocialLogins> */}
        </Stack>
      ) : (
        <Terms
          hideTerms={setHideTerms}
          agreedToTerms={terms}
          termsChanged={(value) => {
            setTerms(value);
          }}
          agreedToConsent={consent}
          consentChanged={(value) => {
            setConsent(value);
          }}
        ></Terms>
      )}
    </>
  );
};

const ForgotPasswordView = ({ setForgotOptions, setActiveView, hideModal }) => {
  const { colorMode } = useColorMode();
  const { recover } = authentication;
  const { setInTransaction, setErrorToastMessage } = useStore().authentication;
  const [method, setMethod] = useState('');
  const [email, setEmail] = useState('');
  const { t } = useTranslation();

  const onSubmit = async e => {
    e.preventDefault();
    setInTransaction(true);
    try {
      console.log({ method });
      const recovered = await recover(email, method);
      if (!recovered || !recovered.code || !recovered.concealed)
        throw new Error();
      console.log('recovered', recovered);
      setForgotOptions(current => ({
        ...current,
        email,
        method,
        code: recovered.code,
        concealed: recovered.concealed,
        destination: recovered?.destination,
      }));
      setInTransaction(false);
      setActiveView('reset');
    } catch (error) {
      console.log('error', error);
      setErrorToastMessage(t('errors.recover'));
      setInTransaction(false);
      return;
    }
  };
  return (
    <Stack spacing={4} as="form" onSubmit={onSubmit}>
      <FormControl isRequired>
        <FormLabel>{t('global.email')}</FormLabel>
        <Input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </FormControl>
      <Text>{t('forgotPassword.message')}</Text>
      <Text fontWeight={'bold'}>{t('forgotPassword.codeOptions')}</Text>
      <FormControl isRequired>
        <RadioGroup
          onChange={setMethod}
          value={method}
          mb={4}
          defaultChecked={method}
        >
          <Stack direction="column">
            <Radio value="sms">{t('forgotPassword.sms')}</Radio>
            <Radio value="call">{t('forgotPassword.call')}</Radio>
            <Radio value="email">{t('forgotPassword.email')}</Radio>
          </Stack>
        </RadioGroup>
      </FormControl>
      <Button variant={'brand'} type="submit">
        {t('forgotPassword.sendCode')}
      </Button>
      <Button
        variant={'link'}
        color={colorMode === 'light' ? 'brandDark' : 'white'}
        _hover={{ opacity: 0.9 }}
        onClick={() => {
          hideModal();
          setTimeout(() => setActiveView('init'), 500);
        }}
      >
        {t('global.cancel')}
      </Button>
    </Stack>
  );
};

const ResetPasswordView = ({ options, setActiveView, hideModal }) => {
  const { colorMode } = useColorMode();

  const { confirmUser, auth, setInTransaction } = useStore().authentication;
  const { reset: resetPassword, recover } = authentication;

  const [verifyError, setVerifyError] = useState(false);
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordsDontMatch, setPasswordsDontMatch] = useState(false);
  const [pin, setPin] = useState('');
  const [code, setCode] = useState(options?.code);
  const { t } = useTranslation();

  // console.log({ options });
  // console.log({ pin });

  const onSubmit = async e => {
    e.preventDefault();

    try {
      if (password !== password2) return setPasswordsDontMatch(true);
      if (!pin || pin.length < 6) return setVerifyError(true);

      setInTransaction(true);

      // TODO: Update API to remove need for /confirm endpoint
      // const confirmed = await confirmUser(options.destination, pin);
      // if (!confirmed) throw new Error('verify error');

      const updated = await resetPassword(options.email, options.code, password);
      if (!updated) throw new Error('password error');
      //LOGIN USER SINCE THEY ALREADY COMPLETED AN MFA FOR THE FORGOT PASSWORD
      await auth(options.email, password, true);
    } catch (error) {
      setVerifyError(true);
      setPassword('');
      setPassword2('');
      setPin('');
      console.log('error', error);
      setInTransaction(false);
    }
  };

  return (
    <Stack spacing={4} as="form" onSubmit={onSubmit}>
      <Text fontWeight="bold" mx={0} mb={6}>
        {t('resetPassword.message')}
      </Text>
      <FormControl isRequired>
        <Center flexDirection={'column'}>
          <HStack mb={2}>
            <PinInput
              otp
              value={pin}
              onChange={e => {
                setPin(e)
                setVerifyError(false);
              }}
              onComplete={e => {
                setPin(e);
                console.log('onComplete', e);
                setVerifyError(false);
              }}
              size="lg"
              name="pin"
            >
              <PinInputField />
              <PinInputField />
              <PinInputField />
              <PinInputField />
              <PinInputField />
              <PinInputField />
            </PinInput>
          </HStack>
        </Center>
      </FormControl>
      <Button
        variant={'link'}
        color="gray.600"
        onClick={async () => {
          setInTransaction(true);
          const recovered = await recover(options.email, options.method);
          if (!recovered || !recovered.code || !recovered.concealed)
            console.log('error with recover');
          if (!options.code) setCode(recovered?.code);
          setInTransaction(false);
        }}
      >
        {t('resetPassword.resendCode')}
      </Button>
      {verifyError ? (
        <Text color="red.500">{t('resetPassword.invalidCode')}</Text>
      ) : (
        ''
      )}
      <FormControl isRequired>
        <FormLabel>{t('settingsPassword.newPassword')}</FormLabel>
        <InputGroup>
          <Input
            type={showPassword ? 'text' : 'password'}
            onChange={e => setPassword(e.target.value)}
            value={password || ''}
            placeholder={t('settingsPassword.placeholder')}
            // pattern={
            //   '(?=[A-Za-z0-9]+$)^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,}).*$'
            // }
            name="pass1"
          />
          <InputRightElement h={'full'}>
            <Button
              variant={'ghost'}
              onClick={() => setShowPassword(showPassword => !showPassword)}
            >
              {showPassword ? (
                <ViewIcon aria-label={t('settingsPassword.hide')} />
              ) : (
                <ViewOffIcon aria-label={t('settingsPassword.show')} />
              )}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl isRequired isInvalid={passwordsDontMatch}>
        <FormLabel>Retype New Password</FormLabel>
        <InputGroup>
          <Input
            type={showPassword ? 'text' : 'password'}
            onChange={e => {
              setPassword2(e.target.value);
              setPasswordsDontMatch(false);
            }}
            value={password2 || ''}
            placeholder={t('settingsPassword.password')}
            name="pass2"
          />
        </InputGroup>
        <FormErrorMessage>{t('settingsPassword.errorMatch')}</FormErrorMessage>
      </FormControl>
      <Flex justifyContent={'space-around'} w="100%" fontSize="sm" my={2}>
        <VStack
          spacing={0}
          color={password.length > 7 ? 'ariaGreenText' : 'red.500'}
        >
          <Text fontSize={'xl'} fontWeight="bold">
            8+
          </Text>
          <Text color="ariaRedText">{t('settingsPassword.characters')}</Text>
          {password.length > 7 ? (
            <CheckCircleIcon size="xs" />
          ) : (
            <WarningTwoIcon size="xs" />
          )}
        </VStack>
        <VStack
          spacing={0}
          color={hasUpperCase(password) ? 'ariaGreenText' : 'red.500'}
        >
          <Text fontSize={'xl'} fontWeight="bold">
            A-Z
          </Text>
          <Text color={'ariaRedText'}>{t('settingsPassword.uppercase')}</Text>
          {hasUpperCase(password) ? (
            <CheckCircleIcon size="xs" />
          ) : (
            <WarningTwoIcon size="xs" />
          )}
        </VStack>
        <VStack
          spacing={0}
          color={hasLowerCase(password) ? 'ariaGreenText' : 'red.500'}
        >
          <Text fontSize={'xl'} fontWeight="bold">
            a-z
          </Text>
          <Text color="ariaRedText">{t('settingsPassword.lowercase')}</Text>
          {hasLowerCase(password) ? (
            <CheckCircleIcon size="xs" />
          ) : (
            <WarningTwoIcon size="xs" />
          )}
        </VStack>
        <VStack
          spacing={0}
          color={hasNumber(password) ? 'ariaGreenText' : 'red.500'}
        >
          <Text fontSize={'xl'} fontWeight="bold">
            0-9
          </Text>
          <Text color="ariaRedText">{t('settingsPassword.number')}</Text>
          {hasNumber(password) ? (
            <CheckCircleIcon size="xs" />
          ) : (
            <WarningTwoIcon size="xs" />
          )}
        </VStack>
      </Flex>
      <Button variant={'brand'} type="submit">
        {t('global.submit')}
      </Button>
      <Button
        variant={'link'}
        color={colorMode === 'light' ? 'brandDark' : 'white'}
        _hover={{ opacity: 0.9 }}
        onClick={() => {
          hideModal();
          setTimeout(() => setActiveView('init'), 500);
        }}
      >
        {t('global.cancel')}
      </Button>
    </Stack>
  );
};

// const SocialLogins = ({ setActiveView, rest }) => {
//   const { colorMode } = useColorMode();
//   return (
//     <Stack alignItems={'center'} flexDir="column" spacing={4} {...rest}>
//       <HStack>
//         <Icon as={BsFacebook} w={5} h={5}></Icon>
//         <Button
//           color={colorMode === 'light' ? 'brandDark' : 'white'}
//           as="span"
//           variant={'link'}
//           onClick={() => setActiveView('facebook')}
//         >
//           Login with Facebok
//         </Button>
//       </HStack>
//       <HStack>
//         <Icon as={BsGoogle} w={5} h={5}></Icon>
//         <Button
//           color={colorMode === 'light' ? 'brandDark' : 'white'}
//           as="span"
//           variant={'link'}
//           onClick={() => setActiveView('google')}
//         >
//           Login with Google
//         </Button>
//       </HStack>
//     </Stack>
//   );
// };

const Terms = ({ hideTerms, agreedToTerms, termsChanged, agreedToConsent, consentChanged }) => {
  const { colorMode } = useColorMode();
  const { t } = useTranslation();

  return (
    <Stack spacing={4}>
      <Heading
        as="h2"
        size="lg"
        fontWeight="400"
        color={colorMode === 'light' ? 'brandDark' : 'brand'}
      >
        {t('loginWizard.header')}
      </Heading>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        {t('loginWizard.headerText')}
      </Text>
      <Text as={'b'} color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        {t('loginWizard.availability')}
      </Text>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'} whiteSpace="pre-line">
        {t('loginWizard.availabilityText')}
      </Text>
      <Text as={'b'} color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        {t('loginWizard.liability')}
      </Text>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'} whiteSpace="pre-line">
        {t('loginWizard.liabilityText')}
      </Text>
      <Text as={'b'} color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        {t('loginWizard.privacy')}
      </Text>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'} whiteSpace="pre-line">
        {t('loginWizard.privacyText')}
      </Text>
      <Text as={'b'} color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        {t('loginWizard.changesToApp')}
      </Text>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'} whiteSpace="pre-line">
        {t('loginWizard.changesToAppText')}
      </Text>
      <Text as={'b'} color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        {t('loginWizard.ownership')}
      </Text>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'} whiteSpace="pre-line">
        {t('loginWizard.ownershipText')}
      </Text>
      <Text as={'b'} color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        {t('loginWizard.liabilityLimitation')}
      </Text>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'} whiteSpace="pre-line">
        {t('loginWizard.liabilityLimitationText')}
      </Text>
      <Text as={'b'} color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        {t('loginWizard.disclaimer')}
      </Text>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'} whiteSpace="pre-line">
        {t('loginWizard.disclaimerText')}
      </Text>
      <Text as={'b'} color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        {t('loginWizard.indemnification')}
      </Text>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'} whiteSpace="pre-line">
        {t('loginWizard.indemnificationText')}
      </Text>
      <Text as={'b'} color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        {t('loginWizard.miscellaneous')}
      </Text>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'} whiteSpace="pre-line">
        {t('loginWizard.miscellaneousText')}
      </Text>
      <Text as={'b'} color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        {t('loginWizard.changesToTerms')}
      </Text>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'} whiteSpace="pre-line">
        {t('loginWizard.changesToTermsText')}
      </Text>
      <Divider />
      <Heading
        as="h2"
        size="lg"
        fontWeight="400"
        color={colorMode === 'light' ? 'brandDark' : 'brand'}
      >
        {t('loginWizard.consent.title')}
      </Heading>
      <Text as={'b'} color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        {t('loginWizard.consent.header')}
      </Text>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'} whiteSpace="pre-line">
        {t('loginWizard.consent.headerText')}
      </Text>
      <Text as={'b'} color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        {t('loginWizard.consent.header')}
      </Text>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'} whiteSpace="pre-line">
        {t('loginWizard.consent.headerText')}
      </Text>
      <Text as={'b'} color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        {t('loginWizard.consent.info1')}
      </Text>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'} whiteSpace="pre-line">
        {t('loginWizard.consent.info1Text')}
      </Text>
      <Text as={'b'} color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        {t('loginWizard.consent.q1')}
      </Text>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'} whiteSpace="pre-line">
        {t('loginWizard.consent.a1')}
      </Text>
      <Text as={'b'} color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        {t('loginWizard.consent.q2')}
      </Text>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'} whiteSpace="pre-line" paddingStart={4}>
        {t('loginWizard.consent.a2a')}
        <br />
        {t('loginWizard.consent.a2b')}
        <br />
        {t('loginWizard.consent.a2c')}
        <br />
        {t('loginWizard.consent.a2d')}
        <br />
        {t('loginWizard.consent.a2e')}
      </Text>
      <Text as={'b'} color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        {t('loginWizard.consent.q3')}
      </Text>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'} whiteSpace="pre-line">
        {t('loginWizard.consent.a3')}
      </Text>
      <Text as={'b'} color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        {t('loginWizard.consent.q4')}
      </Text>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'} whiteSpace="pre-line">
        {t('loginWizard.consent.a4')}
      </Text>
      <Text as={'b'} color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        {t('loginWizard.consent.q5')}
      </Text>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'} whiteSpace="pre-line">
        {t('loginWizard.consent.a5')}
      </Text>
      <Text as={'b'} color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        {t('loginWizard.consent.q6')}
      </Text>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'} whiteSpace="pre-line">
        {t('loginWizard.consent.a6')}
      </Text>
      <Text as={'b'} color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        {t('loginWizard.consent.q7')}
      </Text>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'} whiteSpace="pre-line">
        {t('loginWizard.consent.a7')}
      </Text>
      <Text as={'b'} color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        {t('loginWizard.consent.info2')}
      </Text>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'} whiteSpace="pre-line">
        {t('loginWizard.consent.info2Text')}
      </Text>
      <Text as={'b'} color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        {t('loginWizard.consent.q8')}
      </Text>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'} whiteSpace="pre-line">
        {t('loginWizard.consent.a8a')}
      </Text>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'} whiteSpace="pre-line" paddingStart={4}>
        {t('loginWizard.consent.a8b')}
        <br />
        {t('loginWizard.consent.a8c')}
        <br />
        {t('loginWizard.consent.a8d')}
        <br />
        {t('loginWizard.consent.a8e')}
        <br />
        {t('loginWizard.consent.a8f')}
      </Text>
      <Text as={'b'} color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        {t('loginWizard.consent.q9')}
      </Text>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'} whiteSpace="pre-line">
        {t('loginWizard.consent.a9')}
      </Text>
      <Text as={'b'} color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        {t('loginWizard.consent.q10')}
      </Text>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'} whiteSpace="pre-line">
        {t('loginWizard.consent.a10')}
      </Text>
      <Text as={'b'} color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        {t('loginWizard.consent.q11')}
      </Text>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'} whiteSpace="pre-line">
        {t('loginWizard.consent.a11')}
      </Text>
      <Text as={'b'} color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        {t('loginWizard.consent.q12')}
      </Text>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'} whiteSpace="pre-line">
        {t('loginWizard.consent.a12')}
      </Text>
      <Text as={'b'} color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        {t('loginWizard.consent.q13')}
      </Text>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'} whiteSpace="pre-line">
        {t('loginWizard.consent.a13')}
      </Text>
      <Text as={'b'} color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        {t('loginWizard.consent.q14')}
      </Text>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'} whiteSpace="pre-line">
        {t('loginWizard.consent.a14')}
      </Text>
      <Text as={'b'} color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        {t('loginWizard.consent.q15')}
      </Text>
      <Text as={'b'} color={colorMode === 'light' ? 'gray.900' : 'gray.400'} paddingStart={4}>
        {t('loginWizard.consent.q15q1')}
      </Text>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'} whiteSpace="pre-line" paddingStart={4}>
        {t('loginWizard.consent.q15a1')}
      </Text>
      <Text as={'b'} color={colorMode === 'light' ? 'gray.900' : 'gray.400'} paddingStart={4}>
        {t('loginWizard.consent.q15q2')}
      </Text>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'} whiteSpace="pre-line" paddingStart={4}>
        {t('loginWizard.consent.q15a2')}
      </Text>
      <Flex direction="column" alignItems="center">
        <Checkbox
          name="terms-confirm"
          marginBottom={5}
          onChange={(e) => {
            if (termsChanged) {
              termsChanged(e.target.checked);
            }
          }}
          isChecked={agreedToTerms}
        >
          {t('loginWizard.termsMessage')}
        </Checkbox>
        <Checkbox
          name="consent-confirm"
          marginBottom={5}
          alignItems="flex-start"
          onChange={(e) => {
            if (termsChanged) {
              consentChanged(e.target.checked);
            }
          }}
          isChecked={agreedToConsent}
        >
          {t('loginWizard.consent.confirm')}
        </Checkbox>
      </Flex>
      <Flex justifyContent={'space-between'}>
        <Button
          variant={'brand'}
          width={'100%'}
          onClick={() => {
            hideTerms(true);
          }}
        >
          {t('global.close')}
        </Button>
        {/* <Button
          variant={'brand'}
          onClick={() => {
            agreedToTerms(true);
            hideTerms(true);
          }}
        >
          {t('loginWizard.accept')}
        </Button>
        <Button
          variant={'error'}
          onClick={() => {
            agreedToTerms(false);
            hideTerms(true);
          }}
        >
          {t('loginWizard.decline')}
        </Button> */}
      </Flex>
    </Stack>
  );
};
