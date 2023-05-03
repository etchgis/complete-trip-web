import {
  Box,
  Button,
  Center,
  Checkbox,
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
import { validators } from '../../utils/validators';

const { hasLowerCase, hasNumber, hasUpperCase } = validators;

export const LoginRegister = observer(({ hideModal }) => {
  const {
    loggedIn,
    auth: authLogin,
    error: authError,
    setError: authSetError,
    verifyUser,
  } = useStore().authentication;

  const [stagedUser, setStagedUser] = useState({});
  const [activeView, setActiveView] = useState('init');
  const [loginMessage, setLoginMessage] = useState('');
  const [forgotOptions, setForgotOptions] = useState({});

  useEffect(() => {
    if (loggedIn) hideModal();
  }, [loggedIn, hideModal]);

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
          <Image src={'/buffalo_logo_full.png'} h={'200px'} />
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

  return (
    <Stack spacing={4}>
      <Box p={10}></Box>
      <Button
        bg={'brand'}
        color="white"
        fontWeight={500}
        _hover={{
          opacity: 0.9,
        }}
        onClick={() => {
          setActiveView('login');
        }}
      >
        Login
      </Button>
      <Button
        variant={'outline'}
        color="brandDark"
        _hover={{ opacity: 0.9 }}
        borderColor={colorMode === 'light' ? 'brand' : 'white'}
        bg={colorMode === 'light' ? 'transparent' : 'white'}
        onClick={() => {
          setActiveView('create');
        }}
      >
        Sign Up
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
        Continue as Guest
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
  setStagedUser,
  verifyUser,
}) => {
  const { colorMode } = useColorMode();
  const [showPassword, setShowPassword] = useState(false);
  const [showLogin, setShowLogin] = useState(isLogin);
  const [loginError, setLoginHasError] = useState(false);
  const [hideTerms, setHideTerms] = useState(true);
  const [shownTerms, setShownTerms] = useState(false);

  const { auth, initUser } = useStore().authentication;

  useEffect(() => {
    console.log(error);

    if (error) return setLoginHasError(true);
    setLoginHasError(false);
    //eslint-disable-next-line
  }, [error]);

  // FORM STATES
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    setLoginHasError(false);
    setError(null);
    //eslint-disable-next-line
  }, [firstName, lastName, password, email]);

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
                <FormControl id="name" isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    type="text"
                    onChange={e => setFirstName(e.target.value)}
                    value={firstName || ''}
                  />
                </FormControl>
                <FormControl id="name" isRequired>
                  <FormLabel>Last Name</FormLabel>
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
              {/* <Heading
                as="h1"
                size="2xl"
                fontWeight={400}
                color="brandText"
                textAlign={'center'}
                mb={8}
              >
                Welcome Back
              </Heading> */}
              <Text>{loginMessage}</Text>
            </>
          )}
          {loginError && showLogin ? (
            <Box color="red.500">An error occurred logging in.</Box>
          ) : (
            ''
          )}
          <FormControl isRequired>
            <FormLabel>Email address</FormLabel>
            <Input
              type="email"
              onChange={e => setEmail(e.target.value)}
              value={email || ''}
            />
          </FormControl>
          <FormControl id="password" isRequired>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? 'text' : 'password'}
                onChange={e => setPassword(e.target.value)}
                value={password || ''}
                placeholder="Enter 8 character password"
                pattern={
                  '(?=[A-Za-z0-9]+$)^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,}).*$'
                }
              />
              <InputRightElement h={'full'}>
                <Button
                  variant={'ghost'}
                  onClick={() => setShowPassword(showPassword => !showPassword)}
                >
                  {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>
          {!showLogin ? (
            <Flex justifyContent={'space-around'}>
              <VStack
                spacing={0}
                color={password.length > 7 ? 'green.400' : 'red.400'}
              >
                <Text fontSize={'xl'} fontWeight="bold">
                  8+
                </Text>
                <Text>Characters</Text>
                {password.length > 7 ? (
                  <CheckCircleIcon size="xs" />
                ) : (
                  <WarningTwoIcon size="xs" />
                )}
              </VStack>
              <VStack
                spacing={0}
                color={hasUpperCase(password) ? 'green.400' : 'red.400'}
              >
                <Text fontSize={'xl'} fontWeight="bold">
                  A-Z
                </Text>
                <Text>Uppercase</Text>
                {hasUpperCase(password) ? (
                  <CheckCircleIcon size="xs" />
                ) : (
                  <WarningTwoIcon size="xs" />
                )}
              </VStack>
              <VStack
                spacing={0}
                color={hasLowerCase(password) ? 'green.400' : 'red.400'}
              >
                <Text fontSize={'xl'} fontWeight="bold">
                  a-z
                </Text>
                <Text>Lowercase</Text>
                {hasLowerCase(password) ? (
                  <CheckCircleIcon size="xs" />
                ) : (
                  <WarningTwoIcon size="xs" />
                )}
              </VStack>
              <VStack
                spacing={0}
                color={hasNumber(password) ? 'green.400' : 'red.400'}
              >
                <Text fontSize={'xl'} fontWeight="bold">
                  0-9
                </Text>
                <Text>Number</Text>
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
              <Checkbox name="terms" isReadOnly={true} isChecked={shownTerms}>
                I have read the{' '}
                <Button
                  variant={'link'}
                  onClick={() => setHideTerms(false)}
                  color="blue.400"
                  textDecoration={'underline'}
                >
                  terms and conditions
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
              >
                Forgot Password?
              </Button>
            </Box>
          ) : (
            ''
          )}
          <Button
            bg={'brand'}
            color={'white'}
            _hover={{
              bg: 'blue.500',
            }}
            type="submit"
            mt={6}
            isDisabled={
              showLogin ? false : !showLogin && !shownTerms ? true : false
            }
          >
            {showLogin ? 'Login' : 'Create Account'}
          </Button>
          <Center p={6}>
            <Text color={'gray.500'}>
              {showLogin
                ? 'Already have an account?'
                : "Don't have an account?"}
            </Text>
            <Button
              color={colorMode === 'light' ? 'brandDark' : 'white'}
              as="span"
              variant={'link'}
              onClick={() => setShowLogin(!showLogin)}
              ml={2}
            >
              {showLogin ? 'Create Account' : 'Login'}
            </Button>
          </Center>
          {/* <SocialLogins
          setActiveView={setActiveView}
        ></SocialLogins> */}
        </Stack>
      ) : (
        <Terms hideTerms={setHideTerms} agreedToTerms={setShownTerms}></Terms>
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
      setErrorToastMessage('Error sending code. Please try again.');
      setInTransaction(false);
      return;
    }
  };
  return (
    <Stack spacing={4} as="form" onSubmit={onSubmit}>
      <FormControl isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </FormControl>
      <Text>
        In order to reset your password, a code will need to be sent to the
        email or device registered with us.
      </Text>
      <Text fontWeight={'bold'}>How would you like to receive the code?</Text>
      <FormControl isRequired>
        <RadioGroup
          onChange={setMethod}
          value={method}
          mb={4}
          defaultChecked={method}
        >
          <Stack direction="column">
            <Radio value="sms">Text me</Radio>
            <Radio value="call">Call me</Radio>
            <Radio value="email">Email me</Radio>
          </Stack>
        </RadioGroup>
      </FormControl>
      <Button
        variant={'solid'}
        bg="brand"
        color="white"
        _hover={{ opacity: 0.9 }}
        type="submit"
      >
        Submit
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
        Cancel
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

  // console.log({ options });
  // console.log({ pin });

  const onSubmit = async e => {
    e.preventDefault();

    try {
      if (password !== password2) return setPasswordsDontMatch(true);
      if (!pin || pin.length < 6) return setVerifyError(true);

      setInTransaction(true);

      const confirmed = await confirmUser(options.destination, pin);
      if (!confirmed) throw new Error('verify error');

      const updated = await resetPassword(options.email, code, password);
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
        Type in the 6-digit code. The code can also be pasted in the first box.
      </Text>
      <FormControl isRequired>
        <Center flexDirection={'column'}>
          <HStack mb={2}>
            <PinInput
              otp
              value={pin}
              onChange={e => {
                setPin(e);
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
        onClick={async () => {
          setInTransaction(true);
          const recovered = await recover(options.email, options.method);
          if (!recovered || !recovered.code || !recovered.concealed)
            console.log('error with recover');
          setCode(recovered?.code);
          setInTransaction(false);
        }}
      >
        Send Another Code?
      </Button>
      {verifyError ? <Text color="red.500">Invalid code.</Text> : ''}
      <FormControl isRequired>
        <FormLabel>New Password</FormLabel>
        <InputGroup>
          <Input
            type={showPassword ? 'text' : 'password'}
            onChange={e => setPassword(e.target.value)}
            value={password || ''}
            placeholder="Enter 8 character password"
            pattern={
              '(?=[A-Za-z0-9]+$)^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,}).*$'
            }
            name="pass1"
          />
          <InputRightElement h={'full'}>
            <Button
              variant={'ghost'}
              onClick={() => setShowPassword(showPassword => !showPassword)}
            >
              {showPassword ? <ViewIcon /> : <ViewOffIcon />}
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
            placeholder="Password *"
            name="pass2"
          />
        </InputGroup>
        <FormErrorMessage>Passwords must match.</FormErrorMessage>
      </FormControl>
      <Flex justifyContent={'space-around'} w="100%" fontSize="sm" my={2}>
        <VStack
          spacing={0}
          color={password.length > 7 ? 'green.400' : 'red.400'}
        >
          <Text fontSize={'xl'} fontWeight="bold">
            8+
          </Text>
          <Text>Characters</Text>
          {password.length > 7 ? (
            <CheckCircleIcon size="xs" />
          ) : (
            <WarningTwoIcon size="xs" />
          )}
        </VStack>
        <VStack
          spacing={0}
          color={hasUpperCase(password) ? 'green.400' : 'red.400'}
        >
          <Text fontSize={'xl'} fontWeight="bold">
            A-Z
          </Text>
          <Text>Uppercase</Text>
          {hasUpperCase(password) ? (
            <CheckCircleIcon size="xs" />
          ) : (
            <WarningTwoIcon size="xs" />
          )}
        </VStack>
        <VStack
          spacing={0}
          color={hasLowerCase(password) ? 'green.400' : 'red.400'}
        >
          <Text fontSize={'xl'} fontWeight="bold">
            a-z
          </Text>
          <Text>Lowercase</Text>
          {hasLowerCase(password) ? (
            <CheckCircleIcon size="xs" />
          ) : (
            <WarningTwoIcon size="xs" />
          )}
        </VStack>
        <VStack
          spacing={0}
          color={hasNumber(password) ? 'green.400' : 'red.400'}
        >
          <Text fontSize={'xl'} fontWeight="bold">
            0-9
          </Text>
          <Text>Number</Text>
          {hasNumber(password) ? (
            <CheckCircleIcon size="xs" />
          ) : (
            <WarningTwoIcon size="xs" />
          )}
        </VStack>
      </Flex>
      <Button
        variant={'solid'}
        bg="brand"
        color="white"
        _hover={{ opacity: 0.9 }}
        type="submit"
      >
        Submit
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
        Cancel
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

const Terms = ({ hideTerms, agreedToTerms }) => {
  const { colorMode } = useColorMode();
  return (
    <Stack spacing={4}>
      <Heading
        as="h2"
        size="lg"
        fontWeight="400"
        color={colorMode === 'light' ? 'brandDark' : 'brand'}
      >
        Terms and Conditions
      </Heading>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        Please read and accept the terms and conditions.
      </Text>
      <Box>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed auctor,
        magna id congue commodo, ipsum velit sollicitudin velit, vel tincidunt
        velit augue id odio. Sed varius, nibh quis malesuada aliquet, turpis
        augue convallis odio, id malesuada quam magna sit amet massa. Nam
        bibendum justo eget ante luctus, in aliquet enim faucibus. Praesent id
        ligula eget erat auctor euismod. Praesent auctor, enim id faucibus
        aliquam, odio erat posuere ipsum, eu malesuada ipsum magna sit amet
        turpis. Sed ac semper magna. Sed malesuada, magna eget malesuada
        pellentesque, leo ligula ornare velit, id condimentum augue orci vitae
        elit. Donec quis elit velit. Duis vel mi id ipsum congue vestibulum. Sed
        aliquet, eros eget accumsan scelerisque, nibh nulla placerat velit, id
        dictum velit ipsum vel nibh. In euismod elit velit, vel pellentesque
        ipsum scelerisque vel. Nam augue nibh, aliquet ac facilisis a, placerat
        vitae ipsum. Sed malesuada, turpis id dictum bibendum, magna augue
        malesuada enim, ut viverra risus libero id ligula. Sed pellentesque,
        ipsum vel accumsan malesuada, magna risus interdum nulla, non congue
        urna nibh id magna. Nam eget dolor vestibulum, gravida magna ut, rhoncus
        libero.
      </Box>
      <Flex justifyContent={'space-between'}>
        <Button
          variant={'solid'}
          color="white"
          bg={'brand'}
          _hover={{
            opacity: 0.8,
          }}
          onClick={() => {
            agreedToTerms(true);
            hideTerms(true);
          }}
        >
          Accept
        </Button>
        <Button
          onClick={() => {
            agreedToTerms(false);
            hideTerms(true);
          }}
        >
          Decline
        </Button>
      </Flex>
    </Stack>
  );
};
