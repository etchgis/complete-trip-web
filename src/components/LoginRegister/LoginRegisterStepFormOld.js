import {
  AddIcon,
  DeleteIcon,
  SearchIcon,
  ViewIcon,
  ViewOffIcon,
} from '@chakra-ui/icons';
import {
  Box,
  Button,
  Center,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Icon,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Stack,
  Switch,
  Text,
  VisuallyHiddenInput,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import { BsFacebook, BsGoogle } from 'react-icons/bs';
import { useEffect, useState } from 'react';

import { StepThroughForm } from '../Forms/StepThroughForm';
import geocode from '../../services/transport/geocoder';
import { nanoid } from 'nanoid';
import { phoneFormatter } from '../../helpers/helpers';
import { useAuthenticationStore } from '../../context/AuthenticationStoreZS';
import { validators } from '../../helpers/validators';

const { hasLowerCase, hasNumber, hasUpperCase } = validators;

// import { Link as RouterLink } from 'react-router-dom';

//TODO hide init form if staged user exists and move directly to the register form
//TODO push all state to the parent element and flow down to other forms so they are each dumb forms
//TODO add resetStagedUser for all cancel operations
//TODO register - when submitting the registration please use "3738f2ea-ddc0-4d86-9a8a-4f2ed531a486" for the organization
export const LoginRegisterStepForm = ({ hideModal }) => {
  const {
    loggedIn,
    stagedUser,
    setStagedUser,
    setInTransaction,
    login: authLogin,
    error: authError,
    setError: authSetError,
  } = useAuthenticationStore(state => state);

  if (!!stagedUser?.firstName) console.log(stagedUser);
  const [activeView, setActiveView] = useState('init');

  useEffect(() => {
    setStagedUser();
  }, [setStagedUser]);

  useEffect(() => {
    if (loggedIn) hideModal();
  }, [loggedIn, hideModal]);

  const views = [
    {
      id: 'init',
      view: (
        <Init
          setActiveView={setActiveView}
          setStagedUser={setStagedUser}
          hideModal={hideModal}
        ></Init>
      ),
    },
    {
      id: 'login',
      view: (
        <CreateAccountOrLogin
          setActiveView={setActiveView}
          isLogin={true}
          login={authLogin}
          error={authError}
          setError={authSetError}
          setInTransaction={setInTransaction}
          setStagedUser={setStagedUser}
        ></CreateAccountOrLogin>
      ),
    },
    {
      id: 'create',
      view: (
        <CreateAccountOrLogin
          setActiveView={setActiveView}
          isLogin={false}
          setStagedUser={setStagedUser}
          setError={authSetError}
        ></CreateAccountOrLogin>
      ),
    },
    {
      id: 'forgot',
      view: (
        <ForgotPassword
          setActiveView={setActiveView}
          hideModal={hideModal}
        ></ForgotPassword>
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
    {
      id: 'setup',
      view: (
        <RegisterStepThroughForm
          hideModal={hideModal}
          setActiveView={setActiveView}
          setStagedUser={setStagedUser}
          setInTransaction={setInTransaction}
        ></RegisterStepThroughForm>
      ),
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
};

const Init = ({ setActiveView, setStagedUser, hideModal }) => {
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
            setStagedUser({ id: nanoid(10) });
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
  login,
  setStagedUser,
  setInTransaction,
  error,
  setError,
}) => {
  const { colorMode } = useColorMode();
  const [showPassword, setShowPassword] = useState(false);
  const [showLogin, setShowLogin] = useState(isLogin);
  const [loginError, setLoginHasError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => {
    console.log(error);

    if (error) return setLoginHasError(true);
    setLoginHasError(false);
    //eslint-disable-next-line
  }, [error]);

  // FORM STATES
  const [firstName, setFirstName] = useState();
  const [lastName, setLastName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();

  useEffect(() => {
    setLoginHasError(false);
    setError(null);
    //eslint-disable-next-line
  }, [firstName, lastName, password, email]);

  return (
    <Stack
      spacing={4}
      as="form"
      onSubmit={async e => {
        e.preventDefault();
        if (showLogin) {
          setInTransaction(true);
          login(email, password);
        } else {
          setStagedUser({
            email: email,
            password: password,
            firstName: firstName,
            lastName: lastName,
          });
          setActiveView('setup');
        }
      }}
    >
      {!showLogin ? (
        <Box>
          <HStack>
            <FormControl id="name">
              <FormLabel>Name</FormLabel>
              <Input
                type="text"
                onChange={e => setFirstName(e.target.value)}
                value={firstName || ''}
              />
            </FormControl>
            <FormControl id="name">
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
        ''
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
        {passwordError ? (
          <Box opacity={0.8} fontSize={'sm'} mb={2}>
            Passwords must be 8 characters long and contain at least one
            uppercase letter, one lowercase letter, and one number.
          </Box>
        ) : (
          ''
        )}
        <InputGroup>
          <Input
            type={showPassword ? 'text' : 'password'}
            onChange={e => {
              setPassword(e.target.value);
              if (
                e.target.value.length >= 8 &&
                (!hasUpperCase(e.target.value) ||
                  !hasLowerCase(e.target.value) ||
                  !hasNumber(e.target.value))
              ) {
                setPasswordError(true);
              } else {
                setPasswordError(false);
              }
            }}
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
      >
        {showLogin ? 'Login' : 'Create Account'}
      </Button>
      <Center p={6}>
        <Text color={'gray.500'}>
          {showLogin ? 'Already have an account?' : "Don't have an account?"}
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
  );
};

const ForgotPassword = ({ setActiveView, hideModal }) => {
  const { colorMode } = useColorMode();
  return (
    <Stack spacing={4}>
      <FormControl isRequired>
        <FormLabel>Email address</FormLabel>
        <Input type="email" />
      </FormControl>
      <Button
        variant={'solid'}
        bg="brand"
        color="white"
        _hover={{ opacity: 0.9 }}
        onClick={() => console.log('forgot password click')}
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

const RegisterStepThroughForm = ({ hideModal, setInTransaction }) => {
  const { stagedUser, setStagedUser, register } = useAuthenticationStore();
  return (
    <StepThroughForm
      content={[
        // {
        //   id: 'createAccount',
        //   content: <CreateAccount></CreateAccount>,
        //   action: e => {
        //     e.preventDefault();
        //     console.log(e);
        //   },
        // },
        {
          title: 'contact',
          content: <ContactInfo stagedUser={stagedUser}></ContactInfo>,
          action: e => {
            const data = new FormData(e.target);
            setStagedUser({
              phone: data.get('tel'),
              email: data.get('email'),
            });
          },
        },
        {
          title: 'address',
          content: <HomeAddress stagedUser={stagedUser}></HomeAddress>,
          action: e => {
            const data = new FormData(e.target);
            setStagedUser({
              address: {
                title: data.get('address'),
                description: data.get('description'),
                distance: null,
                point: {
                  lng: data.get('lng'),
                  lat: data.get('lat'),
                },
              },
            });
          },
          skip: true,
        },
        {
          title: 'caretaker',
          content: <Caretaker stagedUser={stagedUser}></Caretaker>,
          action: e => {
            const data = new FormData(e.target);
            setStagedUser({
              caretakers: [
                {
                  firstName: data.get('caretakerFirstName'),
                  lastName: data.get('caretakerLastName'),
                  email: data.get('caretakerEmail'),
                  phone: data.get('caretakerPhone'),
                },
              ],
            });
          },
          skip: true,
        },
        {
          title: 'mobility',
          content: <MobilityOptions stagedUser={stagedUser}></MobilityOptions>,
          skip: true,
          buttonText: 'Check Email Address',
        },
        // {
        //   title: 'sms',
        //   content: <Notifications stagedUser={stagedUser}></Notifications>,
        //   action: e => {
        //     const data = new FormData(e.target);
        //     // console.log(...data);
        //     const notifications = [];
        //     if (data.get('smsAlerts')) notifications.push('sms');
        //     if (data.get('emailAlerts')) notifications.push('email');
        //     setStagedUser({
        //       notifications: notifications,
        //     });
        //   },
        // },
        {
          title: 'terms',
          content: <Terms></Terms>,
          action: async e => {
            const data = new FormData(e.target);
            const terms = [...data];
            console.log(terms[0]);
            // const profile = {
            //   profile: {
            //     firstName: stagedUser.firstName,
            //     lastName: stagedUser.lastName,
            //     address: stagedUser.address,
            //     caretakers: stagedUser.caretakers,
            //     preferences: {
            //       language: 'en',
            //       wheelchair: false,
            //       maxCost: 10,
            //       maxTransfers: 4,
            //       preferredModes: [],
            //       notifications: stagedUser?.notifications || [],
            //       shareWithConcierge: false,
            //     },
            //     terms: terms[0].includes('terms') ? true : false,
            //   },
            // };
            // console.log({ profile });
            setInTransaction(true);
            try {
              const newUser = await register(
                stagedUser.email,
                stagedUser.phone,
                '3738f2ea-ddc0-4d86-9a8a-4f2ed531a486',
                stagedUser.password,
                {
                  firstName: stagedUser.firstName,
                  lastName: stagedUser.lastName,
                  address: stagedUser.address,
                  caretakers: stagedUser.caretakers,
                  preferences: {
                    language: 'en',
                    wheelchair: false,
                    maxCost: 10,
                    maxTransfers: 4,
                    modes: [],
                    notifications: stagedUser?.notifications || [],
                    shareWithConcierge: false,
                  },
                  terms: terms[0].includes('terms') ? true : false,
                }
              );
              console.log(newUser);
              console.log('registered');
              if (newUser) hideModal();
            } catch (error) {
              console.log(error);
            }
          },
        },
      ]}
    ></StepThroughForm>
  );
};

const ContactInfo = ({ stagedUser }) => {
  const [email, setEmail] = useState(stagedUser?.email || '');
  const [phone, setPhone] = useState(stagedUser?.phone || '');
  const { colorMode } = useColorMode();
  return (
    <Stack spacing={4}>
      <Heading
        as="h2"
        size="lg"
        fontWeight="400"
        color={colorMode === 'light' ? 'brandDark' : 'brand'}
      >
        Add Contact Information
      </Heading>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        Your email and phone number are used for two-step verification, password
        recovery, and notifications about your trips.
      </Text>
      <FormControl isRequired>
        <FormLabel>Email address</FormLabel>
        <Input
          type="email"
          name="email"
          onChange={e => setEmail(e.target.value)}
          value={email || ''}
        />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Phone Number</FormLabel>
        <Input
          type="tel"
          name="tel"
          onChange={e => {
            const input = e.target.value.length ? e.target.value : null;
            if (input) return setPhone(phoneFormatter(input));
            return setPhone();
          }}
          value={phone || ''}
          pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
          placeholder="000-000-0000"
        />
      </FormControl>
    </Stack>
  );
};

const HomeAddress = ({ stagedUser }) => {
  const [address, setAddress] = useState(stagedUser?.address?.title || '');
  const [description, setDescription] = useState(
    stagedUser?.address?.description || ''
  );
  const [lng, setLng] = useState(stagedUser?.address?.point?.lng || '');
  const [lat, setLat] = useState(stagedUser?.address?.point?.lat || '');
  const { colorMode } = useColorMode();

  //NOTE placeholder
  useEffect(() => {
    setDescription(address);
  }, [address]);

  const getAddress = async query => {
    const center = lng && lat ? { lng: lng, lat: lat } : null;
    const result = await geocode.forward(query, center);
    console.log(result);
    if (!result) setAddress(query);
    // setAddress(result[0].title);
    return;
  };

  const getUserLocation = allow => {
    if (!allow) {
      setLng();
      setLat();
      return;
    }
    const success = async position => {
      console.log(position);
      setLat(position.coords.latitude);
      setLng(position.coords.longitude);
      const location = await geocode.reverse({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      console.log(location);
    };

    const error = error => {
      console.log(error);
    };
    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 10000,
    });
  };

  return (
    <Stack spacing={4}>
      <Heading
        as="h2"
        size="lg"
        fontWeight="400"
        color={colorMode === 'light' ? 'brandDark' : 'brand'}
      >
        Add Home Address
      </Heading>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        This helps create routes from your home with ease.
      </Text>
      <FormControl isRequired>
        <InputGroup>
          <InputLeftElement
            pointerEvents="none"
            children={<SearchIcon color="gray.500" />}
          />
          <Input
            id="address"
            type="address"
            name="address"
            onChange={e =>
              e.target.value.length > 1000
                ? getAddress(e.target.value)
                : setAddress(e.target.value)
            }
            value={address || ''}
            placeholder="Start typing address here..."
          />
        </InputGroup>
      </FormControl>
      <VisuallyHiddenInput
        type="text"
        name="description"
        value={description || ''}
        onChange={event => {
          console.log(event.target.value);
        }}
      ></VisuallyHiddenInput>
      {/* <FormControl>
        <HStack spacing={2}>
          <Input
            type="number"
            name="lng"
            value={lng || ''}
            readOnly
            required
          ></Input>
          <Input
            type="number"
            name="lat"
            value={lat || ''}
            readOnly
            required
          ></Input>
        </HStack>
      </FormControl> */}
      {/* <Checkbox onChange={e => getUserLocation(e.target.checked)}>
        Allow us to know your location information to provide accurate route
        estimates, pricing, and tracking. (Required)
      </Checkbox> */}
    </Stack>
  );
};

const Caretaker = ({ stagedUser }) => {
  const { colorMode } = useColorMode();
  const [caretakerFirstName, setCaretakerFirstName] = useState(
    stagedUser.caretakers && stagedUser.caretakers.length
      ? stagedUser.caretakers[0].firstName
      : ''
  );
  const [caretakerLastName, setCaretakerLastName] = useState(
    stagedUser.caretakers && stagedUser.caretakers.length
      ? stagedUser.caretakers[0].lastName
      : ''
  );
  const [caretakerEmail, setCaretakerEmail] = useState(
    (stagedUser?.caretakers && stagedUser.caretakers[0]?.email) || ''
  );
  const [caretakerPhone, setCaretakerPhone] = useState();

  return (
    <Stack spacing={4}>
      <Heading
        as="h2"
        size="lg"
        fontWeight="400"
        color={colorMode === 'light' ? 'brandDark' : 'brand'}
      >
        Add Primary Caretaker
      </Heading>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        Notify your companions in 1-touch for any of your trips.
      </Text>
      <HStack>
        <FormControl>
          <FormLabel>First Name</FormLabel>
          <Input
            type="text"
            name="caretakerFirstName"
            onChange={e => setCaretakerFirstName(e.target.value)}
            value={caretakerFirstName || ''}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Last Name</FormLabel>
          <Input
            type="text"
            name="caretakerLastName"
            onChange={e => setCaretakerLastName(e.target.value)}
            value={caretakerLastName || ''}
          />
        </FormControl>
      </HStack>

      <FormControl>
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          name="caretakerEmail"
          onChange={e => setCaretakerEmail(e.target.value)}
          value={caretakerEmail || ''}
        />
      </FormControl>
      <FormControl>
        <FormLabel>Phone</FormLabel>
        <Input
          type="tel"
          name="caretakerPhone"
          onChange={e => {
            const input = e.target.value.length ? e.target.value : null;
            if (input) return setCaretakerPhone(phoneFormatter(input));
            return setCaretakerPhone();
          }}
          value={caretakerPhone || ''}
          pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
          placeholder="000-000-0000"
        />
      </FormControl>
    </Stack>
  );
};

const MobilityOptions = ({ stagedUser }) => {
  const { colorMode } = useColorMode();
  const [email, setEmail] = useState();
  const [email2, setEmail2] = useState();
  const [email3, setEmail3] = useState();
  const [hasEmail2, setHasEmail2] = useState(false);
  const [hasEmail3, setHasEmail3] = useState(false);

  return (
    <Stack spacing={4}>
      <Heading
        as="h2"
        size="lg"
        fontWeight="400"
        color={colorMode === 'light' ? 'brandDark' : 'brand'}
      >
        Enhanced Mobility Options
      </Heading>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        Enter in your email to find enhanced mobility options you are registered
        with such as [x]
      </Text>
      <FormControl>
        <FormLabel>Email address</FormLabel>
        <Input
          type="email"
          name="email"
          onChange={e => setEmail(e.target.value)}
          value={email || ''}
        />
      </FormControl>
      {hasEmail2 ? (
        <FormControl>
          <HStack justifyContent={'space-between'}>
            <FormLabel>Second Email address</FormLabel>
            <IconButton
              aria-label="Remove Email"
              icon={<DeleteIcon />}
              onClick={() => setHasEmail2(false)}
              variant="ghost"
            />
          </HStack>
          <Input
            type="email"
            name="email2"
            onChange={e => setEmail2(e.target.value)}
            value={email2 || ''}
          />
        </FormControl>
      ) : null}
      {hasEmail3 ? (
        <FormControl>
          <HStack justifyContent={'space-between'}>
            <FormLabel>
              {hasEmail2 ? 'Third' : 'Second'} Email address
            </FormLabel>
            <IconButton
              aria-label="Remove Email"
              icon={<DeleteIcon />}
              onClick={() => setHasEmail3(false)}
            />
          </HStack>

          <Input
            type="email"
            name="email3"
            onChange={e => setEmail3(e.target.value)}
            value={email3 || ''}
          />
        </FormControl>
      ) : null}
      {!hasEmail3 || !hasEmail2 ? (
        <Button
          color={colorMode === 'light' ? 'brandDark' : 'gray.400'}
          _hover={{
            opacity: 0.9,
          }}
          w="100%"
          type="button"
          variant={'link'}
          leftIcon={<AddIcon />}
          justifyContent="start"
          onClick={() => {
            if (!hasEmail2) {
              setHasEmail2(true);
            } else if (!hasEmail3) {
              setHasEmail3(true);
            } else return;
          }}
          isDisabled
        >
          Add Another email address
        </Button>
      ) : (
        ''
      )}
    </Stack>
  );
};

export const Notifications = ({ stagedUser }) => {
  const { colorMode } = useColorMode();
  const [sms, setSMS] = useState(stagedUser.smsAlerts ? true : false);
  const [emailAlerts, setEmailAlerts] = useState(
    stagedUser.emailAlerts ? true : false
  );
  // const [pushAlerts, setPushAlerts] = useState(
  //   stagedUser.pushAlerts ? true : false
  // );

  return (
    <Stack spacing={4}>
      <Heading
        as="h2"
        size="lg"
        fontWeight="400"
        color={colorMode === 'light' ? 'brandDark' : 'brand'}
      >
        Get Notifications
      </Heading>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        The app uses notifications to alert you when active navigation is
        happening so you won’t miss a step. To use this application, you must
        have at least one activated.
      </Text>
      {/* {error ? <Box color="red.400">{error}</Box> : ''} */}
      <Box>
        <FormControl display="flex" alignItems="center" pl={10} mb={2}>
          <FormLabel htmlFor="smsAlerts" mb="0" minW={'12'}>
            SMS
          </FormLabel>
          <Switch
            id="smsAlerts"
            name="smsAlerts"
            onChange={e => (e.target.checked ? setSMS(true) : setSMS(false))}
            value={sms}
            isChecked={sms}
            isRequired={!sms && !emailAlerts}
          />
        </FormControl>
        <FormControl display="flex" alignItems="center" pl={10}>
          <FormLabel htmlFor="emailAlerts" mb="0" minW={12}>
            Email
          </FormLabel>
          <Switch
            id="emailAlerts"
            name="emailAlerts"
            onChange={e =>
              e.target.checked ? setEmailAlerts(true) : setEmailAlerts(false)
            }
            value={emailAlerts}
            isChecked={emailAlerts}
            isRequired={!sms && !emailAlerts}
          />
        </FormControl>
      </Box>
    </Stack>
  );
};

const Terms = () => {
  const { colorMode } = useColorMode();
  const { error } = useAuthenticationStore();
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
      {error ? <Box color="red.400">{error}</Box> : ''}
      <Checkbox isRequired name="terms">
        I have read the terms and conditions.
      </Checkbox>
    </Stack>
  );
};
