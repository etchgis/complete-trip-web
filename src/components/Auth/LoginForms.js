import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  useColorMode,
  useColorModeValue,
  Text,
  Icon,
  Heading,
  InputLeftElement,
  Checkbox,
  Switch,
} from '@chakra-ui/react';
import { AddIcon, SearchIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

import { StepThroughForm } from '../Forms/StepThroughForm';
import { nanoid } from 'nanoid';
import { useAuthenticationStore } from '../../context/AuthenticationStoreZS';
import { useEffect, useState } from 'react';
import { BsFacebook, BsGoogle } from 'react-icons/bs';
import geocode from '../../services/transport/geocode';
// import { Link as RouterLink } from 'react-router-dom';

//TODO hide init form if staged user exists and move directly to the register form
//TODO push all state to the parent element and flow down to other forms so they are each dumb forms
//TODO add resetStagedUser for all cancel operations
//TODO register - when submitting the registration please use "3738f2ea-ddc0-4d86-9a8a-4f2ed531a486" for the organization
export const LoginRegisterStepForm = ({ hideModal }) => {
  const {
    user,
    loggedIn,
    stagedUser,
    setStagedUser,
    login: authLogin,
    error: authError,
  } = useAuthenticationStore(state => state);
  console.log({ stagedUser });
  console.log({ user });
  const [activeView, setActiveView] = useState('init');

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
        <Center bg={useColorModeValue('base', 'transparent')} p={8}>
          <Image src={'./assets/images/logo.png'}></Image>
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
  error,
}) => {
  const { colorMode } = useColorMode();
  const [showPassword, setShowPassword] = useState(false);
  const [showLogin, setShowLogin] = useState(isLogin);
  const [loginError, setLoginHasError] = useState(false);
  useEffect(() => {
    if (error) return setLoginHasError(true);
    setLoginHasError(false);
    //eslint-disable-next-line
  }, [error]);

  // FORM STATES
  const [firstName, setFirstName] = useState('John');
  const [lastName, setLastName] = useState('Doe');
  const [email, setEmail] = useState('malcolm+1@getbounds.com');
  const [password, setPassword] = useState('test123');

  useEffect(() => {
    setLoginHasError(false);
  }, [firstName, lastName, password, email]);

  return (
    <Stack
      spacing={4}
      as="form"
      onSubmit={async e => {
        e.preventDefault();
        if (showLogin) {
          login(email, password);
        } else {
          setStagedUser({
            email: email,
            password: password,
          });
          setActiveView('setup');
        }
      }}
    >
      {!showLogin ? (
        <HStack>
          <Box>
            <FormControl id="firstName">
              <FormLabel>First Name</FormLabel>
              <Input
                type="text"
                onChange={e => setFirstName(e.target.value)}
                value={firstName || ''}
              />
            </FormControl>
          </Box>
          <Box>
            <FormControl id="lastName">
              <FormLabel>Last Name</FormLabel>
              <Input
                type="text"
                onChange={e => setLastName(e.target.value)}
                value={lastName || ''}
              />
            </FormControl>
          </Box>
        </HStack>
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
        <InputGroup>
          <Input
            type={showPassword ? 'text' : 'password'}
            onChange={e => setPassword(e.target.value)}
            value={password || ''}
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
        bg={'base'}
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
      <SocialLogins setActiveView={setActiveView}></SocialLogins>
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

const SocialLogins = ({ setActiveView }) => {
  const { colorMode } = useColorMode();
  return (
    <Stack alignItems={'center'} flexDir="column" spacing={4}>
      <HStack>
        <Icon as={BsFacebook} w={5} h={5}></Icon>
        <Button
          color={colorMode === 'light' ? 'brandDark' : 'white'}
          as="span"
          variant={'link'}
          onClick={() => setActiveView('facebook')}
        >
          Login with Facebok
        </Button>
      </HStack>
      <HStack>
        <Icon as={BsGoogle} w={5} h={5}></Icon>
        <Button
          color={colorMode === 'light' ? 'brandDark' : 'white'}
          as="span"
          variant={'link'}
          onClick={() => setActiveView('google')}
        >
          Login with Google
        </Button>
      </HStack>
    </Stack>
  );
};

const RegisterStepThroughForm = ({ hideModal }) => {
  const {
    // stagedUser,
    setStagedUser,
    // register
  } = useAuthenticationStore();
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
          content: <ContactInfo></ContactInfo>,
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
          content: <HomeAddress></HomeAddress>,
          skip: true,
        },
        {
          title: 'caretaker',
          content: <Caretaker></Caretaker>,
          skip: true,
        },
        {
          title: 'mobility',
          content: <MobilityOptions></MobilityOptions>,
          skip: true,
          buttonText: 'Check Email Address',
        },
        {
          title: 'sms',
          content: <Notifications></Notifications>,
          action: e => {
            const data = new FormData(e.target);
            console.log(data.get('smsAlerts'));
            console.log(data.get('emailAlerts'));
            setStagedUser({
              sms: data.get('smsAlerts'),
              email: data.get('emailAlerts'),
            });
          },
        },
        {
          title: 'terms',
          content: <Terms></Terms>,
          action: async () => {
            console.log('registered');
            // const newUser = await register(
            //   stagedUser.email,
            //   stagedUser.phone,
            //   '3738f2ea-ddc0-4d86-9a8a-4f2ed531a486',
            //   stagedUser.password,
            //   {
            //     name: stagedUser.firstName && ' ' && stagedUser.lastName,
            //     address: {},
            //     caretakers: [],
            //     favorites: [],
            //   }
            // );
            // console.log(newUser);
            hideModal();
          },
        },
      ]}
    ></StepThroughForm>
  );
};

const ContactInfo = () => {
  const { stagedUser } = useAuthenticationStore(state => state);
  const [email, setEmail] = useState(stagedUser.email);
  const [phone, setPhone] = useState();
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
        Etiam at pretium tellus. Aenean pharetra mauris id odio bibendum mattis.
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
            if (input) {
              const digits = [];
              if (input.length > 0) digits.push(input.substring(0, 3));
              if (input.length >= 4)
                digits.push(input.replace(/-/g, '').substring(3, 6));
              if (input.length >= 7)
                digits.push(input.replace(/-/g, '').substring(6, 10));
              return setPhone(digits.join('-'));
            }
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

const HomeAddress = () => {
  const [address, setAddress] = useState();
  const [lng, setLng] = useState([]);
  const [lat, setLat] = useState([]);
  const { colorMode } = useColorMode();

  const getAddress = async query => {
    const center = lng && lat ? { lng: lng, lat: lat } : null;
    const result = await geocode.forward(query, center);
    console.log(result);
    if (!result) setAddress(query);
    setAddress(result[0].title);
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
              e.target.value > 1000
                ? getAddress(e.target.value)
                : setAddress(e.target.value)
            }
            value={address || ''}
            placeholder="Start typing address here..."
          />
        </InputGroup>
      </FormControl>
      <FormControl>
        <HStack spacing={2}>
          <Input
            type="number"
            name="lng"
            value={lng || ''}
            readOnly
            disabled
            required
          ></Input>
          <Input
            type="number"
            name="lat"
            value={lat || ''}
            readOnly
            disabled
            required
          ></Input>
        </HStack>
      </FormControl>
      <Checkbox onChange={e => getUserLocation(e.target.checked)}>
        Allow us to know your location information to provide accurate route
        estimates, pricing, and tracking. (Required)
      </Checkbox>
    </Stack>
  );
};

const Caretaker = () => {
  const { colorMode } = useColorMode();
  const [firstName, setFirstName] = useState('Jane');
  const [lastName, setLastName] = useState('Doe');
  const [email, setEmail] = useState('malcolm+2@getbounds.com');
  const [password, setPassword] = useState('test123');
  const [showPassword, setShowPassword] = useState(false);

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
        <Box>
          <FormControl id="firstName">
            <FormLabel>First Name</FormLabel>
            <Input
              type="text"
              onChange={e => setFirstName(e.target.value)}
              value={firstName || ''}
            />
          </FormControl>
        </Box>
        <Box>
          <FormControl id="lastName">
            <FormLabel>Last Name</FormLabel>
            <Input
              type="text"
              onChange={e => setLastName(e.target.value)}
              value={lastName || ''}
            />
          </FormControl>
        </Box>
      </HStack>
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
          />
          <InputRightElement h={'full'}>
            <Button
              color={colorMode === 'light' ? 'brandDark' : 'gray.400'}
              _hover={{
                opacity: 0.9,
              }}
              w="100%"
              type="button"
              variant={'link'}
              onClick={() => setShowPassword(showPassword => !showPassword)}
            >
              {showPassword ? <ViewIcon /> : <ViewOffIcon />}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
    </Stack>
  );
};

const MobilityOptions = () => {
  const { colorMode } = useColorMode();
  const [email, setEmail] = useState('malcolm+2@getbounds.com');

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
      <FormControl isRequired>
        <FormLabel>Email address</FormLabel>
        <Input
          type="email"
          name="email"
          onChange={e => setEmail(e.target.value)}
          value={email || ''}
        />
      </FormControl>
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
      >
        Add Another email address
      </Button>
    </Stack>
  );
};

const Notifications = () => {
  const { colorMode } = useColorMode();
  const [sms, setSMS] = useState(false);
  const [email, setEmail] = useState(true);

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
            isRequired={!sms && !email}
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
              e.target.checked ? setEmail(true) : setEmail(false)
            }
            value={email}
            isChecked={email}
            isRequired={!sms && !email}
          />
        </FormControl>
      </Box>
    </Stack>
  );
};

const Terms = () => {
  const { colorMode } = useColorMode();
  return (
    <Stack spacing={4}>
      <Heading
        as="h2"
        size="lg"
        fontWeight="400"
        color={colorMode === 'light' ? 'brandDark' : 'brand'}
      >
        Terms and Coniditions
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
      <Checkbox isRequired name="terms">
        I have read the terms and conditions.
      </Checkbox>
    </Stack>
  );
};
