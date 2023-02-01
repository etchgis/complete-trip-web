import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Stack,
  Switch,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

import { _alive } from '../../helpers/helpers';
import { phoneFormatter } from '../../helpers/helpers';
import { useAuthenticationStore } from '../../context/AuthenticationStoreZS';
import { useState } from 'react';

export const AccountPage = ({ rest }) => {
  const user = useAuthenticationStore(e => e.user);
  console.log({ user });
  // const { colorMode } = useColorMode();
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState(
    user.phone ? phoneFormatter(user.phone) : ''
  );
  const [sms, setSMS] = useState(
    user.profile.notifications && user.profile.notifications.sms ? true : false
  );
  const [emailAlerts, setEmailAlerts] = useState(
    user.profile.notifications && user.profile.notifications.email
      ? true
      : false
  );

  const saveAccountSettings = e => {
    e.preventDefault();
    console.log(e.target);
    const data = new FormData(e.target);
    console.log(...data);
  };
  return (
    <Box p={10}>
      {_alive(user) ? (
        <Stack spacing={6} as="form" onSubmit={saveAccountSettings}>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              name="name"
              isRequired
              // onChange={e => setFirstName(e.target.value)}
              defaultValue={user.profile.name}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Email address</FormLabel>
            <Input type="email" name="email" defaultValue={user.email} />
          </FormControl>

          <FormControl>
            <FormLabel>Change Password</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? 'text' : 'password'}
                name={'password'}
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

          <FormControl isRequired>
            <FormLabel>Phone Number</FormLabel>
            <Input
              type="tel"
              name="phone"
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

          <VStack spacing={2}>
            <Heading as="h3" size="sm" alignSelf="flex-start" mb={4}>
              Notifications
            </Heading>

            <FormControl display="flex" alignItems="center" pl={10} mb={2}>
              <FormLabel htmlFor="smsAlerts" mb="0" minW={'12'}>
                SMS
              </FormLabel>
              <Switch
                id="smsAlerts"
                name="smsAlerts"
                onChange={e =>
                  e.target.checked ? setSMS(true) : setSMS(false)
                }
                // value={sms}
                isChecked={sms}
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
                  e.target.checked
                    ? setEmailAlerts(true)
                    : setEmailAlerts(false)
                }
                value={emailAlerts}
                isChecked={emailAlerts}
              />
            </FormControl>
          </VStack>

          <FormControl>
            <FormLabel>Maximum Transfers</FormLabel>
            <SliderThumbWithTooltip></SliderThumbWithTooltip>
            <Input type={'number'} name={'length'}></Input>
          </FormControl>

          <FormControl my={4}>
            <FormLabel>Maximum Trip Cost</FormLabel>
            <SliderThumbWithTooltip2></SliderThumbWithTooltip2>
            <Input type={'number'} name={'cost'}></Input>
          </FormControl>

          {/* MInimize walking */}
          {/* wheelchair */}
          {/* modes -  bus, light rail, walk, human shuttle, autonomous shuttle */}
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
      ) : (
        <Box>No User Found!</Box>
      )}
    </Box>
  );
};

function SliderThumbWithTooltip() {
  const [sliderValue, setSliderValue] = useState(5);
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <Slider
      id="slider"
      defaultValue={15}
      min={0}
      max={6}
      colorScheme="blue"
      onChange={v => setSliderValue(v)}
      onChangeEnd={val => console.log(val)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      mb={6}
      mt={2}
    >
      <SliderMark value={0} mt="2" ml="-2.5" fontSize="sm">
        0
      </SliderMark>
      <SliderMark value={2} mt="2" ml="-2.5" fontSize="sm">
        2
      </SliderMark>
      <SliderMark value={4} mt="2" ml="-2.5" fontSize="sm">
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
        <SliderThumb />
      </Tooltip>
    </Slider>
  );
}

function SliderThumbWithTooltip2() {
  const [sliderValue, setSliderValue] = useState(5);
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <Slider
      id="slider2"
      defaultValue={15}
      min={0}
      max={25}
      colorScheme="blue"
      onChange={v => setSliderValue(v)}
      onChangeEnd={val => console.log(val)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      mt={2}
      mb={6}
    >
      <SliderMark value={5} mt="2" ml="-2.5" fontSize="sm">
        $5
      </SliderMark>
      <SliderMark value={10} mt="2" ml="-2.5" fontSize="sm">
        $10
      </SliderMark>
      <SliderMark value={15} mt="2" ml="-2.5" fontSize="sm">
        $15
      </SliderMark>
      <SliderMark value={20} mt="2" ml="-2.5" fontSize="sm">
        $20
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
        <SliderThumb />
      </Tooltip>
    </Slider>
  );
}
