import {
  Box,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Stack,
  Switch,
  Tooltip,
  useRadio,
  useRadioGroup,
} from '@chakra-ui/react';

import { FaExchangeAlt } from 'react-icons/fa';
import { HiCurrencyDollar } from 'react-icons/hi';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useStore } from '../../context/mobx/RootStore';

export const EditTripPreferences = observer(() => {
  const { user, updateUserProfile } = useStore().authentication;
  // const [preferences, setPreferences] = useState(user?.profile?.preferences);
  // const preferences = Object.assign({}, user?.profile?.preferences);
  const preferences = user?.profile?.preferences;

  const [minimizeWalking, setMinimizeWalking] = useState(
    preferences?.minimizeWalking || false
  );
  const [maxCost, setMaxCost] = useState(
    preferences?.maxCost === 0 ? 0 : preferences?.maxCost || 10
  );
  const [maxTransfers, setMaxTransfers] = useState(
    preferences?.maxTransfers === 0 ? 0 : preferences?.maxTransfers || 4
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
      preferences['wheelchair'] = e === 'Yes' ? true : false;
      updateUserProfile(
        Object.assign({}, user?.profile, {
          preferences: preferences,
        })
      );
    },
  });

  const handleModeChange = e => {
    const _modes = preferences?.modes || [];
    if (e.target.checked) {
      setModes([..._modes, e.target.value]);
      preferences['modes'] = [..._modes, e.target.value];
      updateUserProfile(
        Object.assign({}, user?.profile, {
          preferences: preferences,
        })
      );
    } else {
      setModes(_modes.filter(mode => mode !== e.target.value));
      preferences['modes'] = _modes.filter(mode => mode !== e.target.value);
      updateUserProfile(
        Object.assign({}, user?.profile, {
          preferences: preferences,
        })
      );
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
              preferences['minimizeWalking'] = true;
              updateUserProfile(
                Object.assign({}, user?.profile, {
                  preferences: preferences,
                })
              );
            } else {
              setMinimizeWalking(false);
              preferences['minimizeWalking'] = false;
              updateUserProfile(
                Object.assign({}, user?.profile, {
                  preferences: preferences,
                })
              );
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
            preferences['maxCost'] = e;
            updateUserProfile(
              Object.assign({}, user?.profile, { preferences: preferences })
            );
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
            preferences['maxTransfers'] = e;
            updateUserProfile(
              Object.assign({}, user?.profile, {
                preferences: preferences,
              })
            );
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
});

function SliderThumbWithTooltipLength({ action, initialValue }) {
  const [sliderValue, setSliderValue] = useState(initialValue);
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <Slider
      id="slider"
      defaultValue={initialValue}
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
      <SliderMark value={2} mt={3} ml="-1" fontSize="sm">
        2
      </SliderMark>
      <SliderMark value={4} mt={3} ml="-1" fontSize="sm">
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
  const [sliderValue, setSliderValue] = useState(initialValue);
  const [showTooltip, setShowTooltip] = useState(false);
  return (
    <Slider
      id="slider2"
      defaultValue={initialValue}
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
        _focus={{
          boxShadow: 'inset 0 0 8px',
        }}
        px={3}
        py={1}
      >
        {props.children}
      </Box>
    </Box>
  );
}
