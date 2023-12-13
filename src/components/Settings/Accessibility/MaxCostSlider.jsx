import {
  Box,
  FormControl,
  FormLabel,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Tooltip,
} from '@chakra-ui/react';

import { HiCurrencyDollar } from 'react-icons/hi';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useStore } from '../../../context/RootStore.jsx';

const MaxCostSlider = observer(() => {
  const { user, updateUserProfile } = useStore().authentication;
  const preferences = user?.profile?.preferences || {};

  const [maxCost, setMaxCost] = useState(
    preferences?.maxCost === 0 ? 0 : preferences?.maxCost || 10
  );

  return (
    <FormControl my={4}>
      <FormLabel display={'flex'} justifyContent="space-between">
        Maximum Trip Cost <span>${maxCost}</span>
      </FormLabel>
      <SliderThumbWithTooltipCost
        action={e => {
          setMaxCost(e);
          updateUserProfile(
            Object.assign({
              ...user?.profile,
              preferences: {
                ...preferences,
                maxCost: e,
              },
            })
          );
        }}
        initialValue={maxCost}
      ></SliderThumbWithTooltipCost>
    </FormControl>
  );
});

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
      display={'none'}
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

export default MaxCostSlider;
