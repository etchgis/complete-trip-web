import {} from '../../helpers/helpers';

import { AddIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  Skeleton,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Stack,
  Switch,
  Tooltip,
  useColorMode,
  useRadio,
  useRadioGroup,
} from '@chakra-ui/react';

import { FaExchangeAlt } from 'react-icons/fa';
import { HiCurrencyDollar } from 'react-icons/hi';
import { phoneFormatter } from '../../helpers/helpers';
import { useAuthenticationStore } from '../../context/AuthenticationStoreZS';
import { useState } from 'react';

function SharedForm({ children }) {
  // const { updateUserProfile } = useAuthenticationStore();
  return (
    <Box
      as="form"
      onSubmit={async e => {
        e.preventDefault();
        const data = new FormData(e.target);
        console.log(...data);
        // const update = await updateUserProfile({
        //   name: data.get('name'),
        // });
        // console.log({ update });
      }}
    >
      <Stack spacing={4}>
        {children}
        <Button
          bg={'brand'}
          color={'white'}
          _hover={{
            bg: 'blue.500',
          }}
          type="submit"
          mt={6}
        >
          Save
        </Button>
      </Stack>
    </Box>
  );
}

export const EditProfile = () => {
  const { user } = useAuthenticationStore();
  console.log(user);
  const [phone, setPhone] = useState(user?.profile?.phone || '');
  return (
    <SharedForm
      children={
        <Box>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input type="text" name="name" />
          </FormControl>
          {/* email, address, phone */}
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input type="email" name="email" />
          </FormControl>
          <FormControl>
            <FormLabel>Phone</FormLabel>
            <Input
              type="tel"
              name="phone"
              onChange={e => {
                const input = e.target.value.length ? e.target.value : null;
                if (input) return setPhone(phoneFormatter(input));
                return setPhone();
              }}
              value={phone || ''}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Address</FormLabel>
            <Input type="text" name="address" />
          </FormControl>
        </Box>
      }
    />
  );
};
export const Caretakers = () => {
  const { user } = useAuthenticationStore();
  console.log(user);

  return (
    <SharedForm
      children={
        <Stack spacing={4}>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input type="text" name="name" />
          </FormControl>
          <FormControl>
            <FormLabel>Phone</FormLabel>
            <Input type="tel" name="phone" />
          </FormControl>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input type="email" name="email" />
          </FormControl>
        </Stack>
      }
    />
  );
};
export const TripPreferences = () => {
  const { user } = useAuthenticationStore();
  const updateProfile = useUpdateProfile();
  const preferences = user?.profile?.preferences || {};
  // console.log(user);

  const [minimizeWalking, setMinimizeWalking] = useState(
    preferences?.minimizeWalking || false
  );
  const [maxCost, setMaxCost] = useState(preferences?.maxCost || 10);
  const [maxTransfers, setMaxTransfers] = useState(
    preferences?.maxTransfers || 4
  );
  const [modes, setModes] = useState(preferences?.modes || []);
  const [wheelchair, setWheelchair] = useState(
    preferences?.wheelchair || false
  );
  const wheelchairOptions = ['Yes', 'No'];
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'Wheelchair',
    defaultValue: wheelchair ? 'Yes' : 'No',
    onChange: e => {
      setWheelchair(e === 'Yes' ? true : false);
      updateProfile({ wheelchair: e === 'Yes' ? true : false });
    },
  });

  const handleModeChange = e => {
    const _modes = preferences?.modes || [];
    if (e.target.checked) {
      setModes([..._modes, e.target.value]);
      updateProfile({ modes: [..._modes, e.target.value] });
    } else {
      setModes(_modes.filter(mode => mode !== e.target.value));
      updateProfile({
        modes: _modes.filter(mode => mode !== e.target.value),
      });
    }
  };

  const group = getRootProps();
  return (
    <Stack spacing={4}>
      <HStack alignItems={'center'} justifyContent="space-between">
        <Box fontWeight={'bold'}>Minimize Walking</Box>
        <Switch
          name="minimizeWalking"
          onChange={e => {
            if (e.target.checked) {
              setMinimizeWalking(true);
              updateProfile({ minimizeWalking: true });
            } else {
              setMinimizeWalking(false);
              updateProfile({ minimizeWalking: false });
            }
          }}
          // value={minimizeWalking}
          isChecked={minimizeWalking}
        />
      </HStack>
      <FormControl my={4}>
        <FormLabel display={'flex'} justifyContent="space-between">
          Maximum Trip Cost <span>${maxCost}</span>
        </FormLabel>
        <SliderThumbWithTooltipCost
          action={e => {
            setMaxCost(e);
            return updateProfile({ maxCost: e });
          }}
          initialValue={maxCost}
        ></SliderThumbWithTooltipCost>
      </FormControl>
      <FormControl>
        <FormLabel display={'flex'} justifyContent="space-between">
          Maximum Transfers <span>{maxTransfers}</span>
        </FormLabel>
        <SliderThumbWithTooltipLength
          action={e => {
            setMaxTransfers(e);
            return updateProfile({ maxTransfers: e });
          }}
          initialValue={maxTransfers}
        ></SliderThumbWithTooltipLength>
      </FormControl>
      <FormControl>
        <HStack {...group} display={'flex'} justifyContent="space-between">
          <Box>Wheelchair Accessibility</Box>
          <Flex borderRadius={'md'} borderWidth="1px" overflow={'hidden'}>
            {wheelchairOptions.map(value => {
              const radio = getRadioProps({ value });
              return (
                <RadioCard key={value} {...radio}>
                  {value}
                </RadioCard>
              );
            })}
          </Flex>
        </HStack>
      </FormControl>
      <Divider />

      <FormControl>
        <FormLabel>Preferred Mode(s) of Transportation</FormLabel>
        <Stack>
          {/* <Checkbox name="mode_bus">Bus</Checkbox>
          <Checkbox name="mode_light_rail">Light Rail</Checkbox>
          <Checkbox name="mode_walk">Walk</Checkbox>
          <Checkbox name="mode_human_shuttle">Human Shuttle</Checkbox>
          <Checkbox name="mode_autonomous_shuttle">Autonomous Shuttle</Checkbox>
          <Checkbox name="mode_rideshare">Rideshare</Checkbox>
          <Checkbox name="mode_scooter">Scooter</Checkbox> */}
          <Checkbox
            name="modeBicycle"
            value="personal bike"
            isChecked={modes.includes('personal bike')}
            onChange={handleModeChange}
          >
            Bike
          </Checkbox>
          <Checkbox
            name="modeBikeRental"
            value="rental bike"
            isChecked={modes.includes('rental bike')}
            onChange={handleModeChange}
          >
            Bike Rental
          </Checkbox>
          <Checkbox
            name="moddePublicTransit"
            value="public transit"
            isChecked={modes.includes('public transit')}
            onChange={handleModeChange}
          >
            Public Transit
          </Checkbox>
          <Checkbox
            name="modeRideShare"
            value="ride hail"
            isChecked={modes.includes('ride hail')}
            onChange={handleModeChange}
          >
            Ride Share
          </Checkbox>
          <Checkbox
            name="modeAVShuttle"
            value="avl"
            isChecked={modes.includes('avl')}
            onChange={handleModeChange}
          >
            AV Shuttle
          </Checkbox>
        </Stack>
      </FormControl>
      <Divider />

      {/* <FormControl>
        <FormLabel>Enhanced Mobility Options</FormLabel>
        <HStack my={4}>
          <Skeleton startColor="gray.400" endColor="gray.400" h="40px" w="80px">
            Icon
          </Skeleton>
          <Box>
            <Box fontWeight={'bold'}>Title</Box>
            <Box fontSize={'sm'}>email@example.com</Box>
          </Box>
        </HStack>
        <HStack my={4}>
          <Skeleton startColor="gray.400" endColor="gray.400" h="40px" w="80px">
            Icon
          </Skeleton>
          <Box>
            <Box fontWeight={'bold'}>Title</Box>
            <Box fontSize={'sm'}>email@example.com</Box>
          </Box>
        </HStack>
        <Button
          color="brandDark"
          variant="link"
          leftIcon={<AddIcon />}
          size="sm"
        >
          Check for more mobility registrations
        </Button>
      </FormControl> */}
    </Stack>
  );
};
export const PasswordReset = () => {
  const { colorMode } = useColorMode();
  const { user } = useAuthenticationStore();
  console.log(user);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  return (
    <SharedForm
      children={
        <Stack spacing={4}>
          <FormControl>
            <FormLabel>Current Password</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? 'text' : 'password'}
                name={'password'}
                placeholder={'Password'}
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
            <Box fontSize={'md'} mt={'2'} textAlign={'right'}>
              <Button
                color={colorMode === 'light' ? 'brandDark' : 'gray.400'}
                as="span"
                variant={'link'}
                fontWeight="bold"
              >
                Forgot your password?
              </Button>
            </Box>
          </FormControl>

          <Box py={6}>
            <Divider></Divider>
          </Box>

          <FormControl>
            <FormLabel>Enter a New Password</FormLabel>
            <InputGroup>
              <Input
                type={showNewPassword ? 'text' : 'password'}
                name={'new_password'}
                placeholder={'New Password'}
              />
              <InputRightElement h={'full'}>
                <Button
                  variant={'ghost'}
                  onClick={() =>
                    setShowNewPassword(showNewPassword => !showNewPassword)
                  }
                >
                  {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <FormControl>
            <FormLabel>Re-enter Password</FormLabel>
            <InputGroup>
              <Input
                type={showNewPassword ? 'text' : 'password'}
                name={'new_password_test'}
                placeholder={'Password'}
              />
            </InputGroup>
          </FormControl>
        </Stack>
      }
    />
  );
};
export const EditAccessibility = () => {
  const { user } = useAuthenticationStore();
  const [language, setLanguage] = useState(
    user?.profile?.preferences?.language || 'en'
  );
  const updateProfile = useUpdateProfile();

  return (
    <Box>
      <FormControl>
        <FormLabel>Language</FormLabel>
        <Select
          defaultValue={language || ''}
          onChange={e => {
            setLanguage(e.target.value);
            updateProfile({ language: e.target.value });
          }}
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
        </Select>
      </FormControl>
    </Box>
  );
};
export const Notifications = () => {
  const { user } = useAuthenticationStore();
  const updateProfile = useUpdateProfile();

  const [notifications, setNotifications] = useState(
    user?.profile?.preferences?.notifications || []
  );
  const handleAlertChange = e => {
    let newNotifications = [...notifications];
    if (e.target.checked) {
      newNotifications.push(e.target.value);
      setNotifications(newNotifications);
      updateProfile({ notifications: newNotifications });
    } else {
      setNotifications(newNotifications.filter(n => n !== e.target.value));
      updateProfile({
        notifications: newNotifications.filter(n => n !== e.target.value),
      });
    }
  };

  return (
    <Stack spacing={2}>
      <FormControl display="flex" alignItems="center" pl={10} mb={2}>
        <FormLabel htmlFor="smsAlerts" mb="0" minW={'12'}>
          SMS
        </FormLabel>
        <Switch
          name="smsAlerts"
          onChange={handleAlertChange}
          value="sms"
          isChecked={notifications.includes('sms') ? true : false}
        />
      </FormControl>

      <FormControl display="flex" alignItems="center" pl={10}>
        <FormLabel htmlFor="emailAlerts" mb="0" minW={12}>
          Email
        </FormLabel>
        <Switch
          name="emailAlerts"
          onChange={handleAlertChange}
          value="email"
          isChecked={notifications.includes('email') ? true : false}
        />
      </FormControl>
    </Stack>
  );
};

function useUpdateProfile() {
  const { user, updateUserProfile } = useAuthenticationStore();
  const updateProfile = async update => {
    const prefs = user?.profile?.preferences || {};
    try {
      const updatedProfile = Object.assign(prefs, update);
      console.log(updatedProfile);
      await updateUserProfile({ preferences: updatedProfile });
    } catch (error) {
      console.log({ error });
    }
  };
  return updateProfile;
}

// export const AccountPage = ({ rest }) => {
//   const user = useAuthenticationStore(e => e.user);
//   console.log({ user });
//   // const { colorMode } = useColorMode();
//   const [showPassword, setShowPassword] = useState(false);
//   const [phone, setPhone] = useState(
//     user.phone ? phoneFormatter(user.phone) : ''
//   );
//   const [sms, setSMS] = useState(
//     user.profile.notifications && user.profile.notifications.sms ? true : false
//   );
//   const [emailAlerts, setEmailAlerts] = useState(
//     user.profile.notifications && user.profile.notifications.email
//       ? true
//       : false
//   );

//   const saveAccountSettings = e => {
//     e.preventDefault();
//     console.log(e.target);
//     const data = new FormData(e.target);
//     console.log(...data);
//   };
//   return (
//     <Box p={10}>
//       {_alive(user) ? (
//         <Stack spacing={6} as="form" onSubmit={saveAccountSettings}>
//           <FormControl>
//             <FormLabel>Name</FormLabel>
//             <Input
//               type="text"
//               name="name"
//               isRequired
//               // onChange={e => setFirstName(e.target.value)}
//               defaultValue={user.profile.name}
//             />
//           </FormControl>

//           <FormControl isRequired>
//             <FormLabel>Email address</FormLabel>
//             <Input type="email" name="email" defaultValue={user.email} />
//           </FormControl>

//           <FormControl>
//             <FormLabel>Change Password</FormLabel>
//             <InputGroup>
//               <Input
//                 type={showPassword ? 'text' : 'password'}
//                 name={'password'}
//               />
//               <InputRightElement h={'full'}>
//                 <Button
//                   variant={'ghost'}
//                   onClick={() => setShowPassword(showPassword => !showPassword)}
//                 >
//                   {showPassword ? <ViewIcon /> : <ViewOffIcon />}
//                 </Button>
//               </InputRightElement>
//             </InputGroup>
//           </FormControl>

//           <FormControl isRequired>
//             <FormLabel>Phone Number</FormLabel>
//             <Input
//               type="tel"
//               name="phone"
//               onChange={e => {
//                 const input = e.target.value.length ? e.target.value : null;
//                 if (input) return setPhone(phoneFormatter(input));
//                 return setPhone();
//               }}
//               value={phone || ''}
//               pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
//               placeholder="000-000-0000"
//             />
//           </FormControl>

//           <VStack spacing={2}>
//             <Heading as="h3" size="sm" alignSelf="flex-start" mb={4}>
//               Notifications
//             </Heading>

//             <FormControl display="flex" alignItems="center" pl={10} mb={2}>
//               <FormLabel htmlFor="smsAlerts" mb="0" minW={'12'}>
//                 SMS
//               </FormLabel>
//               <Switch
//                 id="smsAlerts"
//                 name="smsAlerts"
//                 onChange={e =>
//                   e.target.checked ? setSMS(true) : setSMS(false)
//                 }
//                 // value={sms}
//                 isChecked={sms}
//               />
//             </FormControl>

//             <FormControl display="flex" alignItems="center" pl={10}>
//               <FormLabel htmlFor="emailAlerts" mb="0" minW={12}>
//                 Email
//               </FormLabel>
//               <Switch
//                 id="emailAlerts"
//                 name="emailAlerts"
//                 onChange={e =>
//                   e.target.checked
//                     ? setEmailAlerts(true)
//                     : setEmailAlerts(false)
//                 }
//                 value={emailAlerts}
//                 isChecked={emailAlerts}
//               />
//             </FormControl>
//           </VStack>

//           <FormControl>
//             <FormLabel>Maximum Transfers</FormLabel>
//             <SliderThumbWithTooltip></SliderThumbWithTooltip>
//             <Input type={'number'} name={'length'}></Input>
//           </FormControl>

//           <FormControl my={4}>
//             <FormLabel>Maximum Trip Cost</FormLabel>
//             <SliderThumbWithTooltip2></SliderThumbWithTooltip2>
//             <Input type={'number'} name={'cost'}></Input>
//           </FormControl>

//           {/* MInimize walking */}
//           {/* wheelchair */}
//           {/* modes -  bus, light rail, walk, human shuttle, autonomous shuttle */}
//           <Button
//             bg={'base'}
//             color={'white'}
//             _hover={{
//               bg: 'blue.500',
//             }}
//             type="submit"
//             mt={6}
//           >
//             Save
//           </Button>
//         </Stack>
//       ) : (
//         <Box>No User Found!</Box>
//       )}
//     </Box>
//   );
// };

function SliderThumbWithTooltipLength({ action, initialValue }) {
  const [sliderValue, setSliderValue] = useState(initialValue || 2);
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <Slider
      id="slider"
      defaultValue={initialValue || 2}
      min={0}
      max={6}
      colorScheme="blue"
      onChange={v => setSliderValue(v)}
      onChangeEnd={action}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      mt={2}
      mb={4}
    >
      <SliderMark value={0} mt={3} ml="-2.5" fontSize="sm">
        0
      </SliderMark>
      <SliderMark value={2} mt={3} ml="-2.5" fontSize="sm">
        2
      </SliderMark>
      <SliderMark value={4} mt={3} ml="-2.5" fontSize="sm">
        4
      </SliderMark>
      <SliderTrack>
        <SliderFilledTrack />
      </SliderTrack>
      <Tooltip
        hasArrow
        bg="brandDark"
        color="white"
        placement="top"
        isOpen={showTooltip}
        label={`${sliderValue} transfers`}
      >
        <SliderThumb boxSize={6}>
          <Box color="brand" as={FaExchangeAlt} />
        </SliderThumb>
      </Tooltip>
    </Slider>
  );
}

function SliderThumbWithTooltipCost({ action, initialValue }) {
  const [sliderValue, setSliderValue] = useState(initialValue || 5);
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <Slider
      id="slider2"
      defaultValue={initialValue || 5}
      min={0}
      max={100}
      colorScheme="blue"
      onChange={v => setSliderValue(v)}
      onChangeEnd={action}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      mt={2}
      mb={4}
    >
      <SliderMark value={25} mt={3} ml="-2.5" fontSize="sm">
        $25
      </SliderMark>
      <SliderMark value={50} mt={3} ml="-2.5" fontSize="sm">
        $50
      </SliderMark>
      <SliderMark value={75} mt={3} ml="-2.5" fontSize="sm">
        $75
      </SliderMark>
      <SliderTrack>
        <SliderFilledTrack />
      </SliderTrack>
      <Tooltip
        hasArrow
        bg="brandDark"
        color="white"
        placement="top"
        isOpen={showTooltip}
        label={`$${sliderValue}`}
      >
        <SliderThumb boxSize={6}>
          <Box color="brand" as={HiCurrencyDollar} />
        </SliderThumb>
      </Tooltip>
    </Slider>
  );
}

// 1. Create a component that consumes the `useRadio` hook
function RadioCard(props) {
  const { getInputProps, getCheckboxProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getCheckboxProps();

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        // borderRadius={'md'}
        _checked={{
          bg: 'brand',
          color: 'white',
          // borderColor: 'teal.600',
        }}
        // _focus={{
        //   boxShadow: 'outline',
        // }}
        px={3}
        py={1}
      >
        {props.children}
      </Box>
    </Box>
  );
}
