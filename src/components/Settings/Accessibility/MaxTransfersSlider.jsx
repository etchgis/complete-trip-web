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

import { FaExchangeAlt } from 'react-icons/fa';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useStore } from '../../../context/RootStore.jsx';
import useTranslation from '../../../models/useTranslation';

const MaxTransfersSlider = observer(() => {
  const { user, updateUserProfile } = useStore().authentication;
  const preferences = user?.profile?.preferences || {};

  const [maxTransfers, setMaxTransfers] = useState(
    preferences?.maxTransfers === 0 ? 0 : preferences?.maxTransfers || 4
  );
  const { t } = useTranslation();
  return (
    <FormControl maxW="95%">
      <FormLabel
        display={'flex'}
        justifyContent="space-between"
        id="maxTransfers"
        label={t('settingsPreferences.maximumTransfers')}
      >
        {t('settingsPreferences.maximumTransfers')} <span>{maxTransfers}</span>
      </FormLabel>
      <SliderThumbWithTooltipLength
        action={e => {
          setMaxTransfers(e);
          updateUserProfile({
            ...user?.profile,
            preferences: {
              ...preferences,
              maxTransfers: e,
            },
          });
        }}
        initialValue={maxTransfers}
      ></SliderThumbWithTooltipLength>
    </FormControl>
  );
});

function SliderThumbWithTooltipLength({ action, initialValue }) {
  const [sliderValue, setSliderValue] = useState(initialValue);
  const [showTooltip, setShowTooltip] = useState(false);
  const { t } = useTranslation();
  return (
    <Slider
      defaultValue={initialValue}
      min={0}
      max={8}
      colorScheme="blue"
      onChange={v => setSliderValue(v)}
      onChangeEnd={action}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      mt={4}
      mb={4}
      aria-label={t('settingsPreferences.maximumTransfers')}
    >
      <SliderMark value={2} mt={3} ml="-1" fontSize="sm">
        2
      </SliderMark>
      <SliderMark value={4} mt={3} ml="-1" fontSize="sm">
        4
      </SliderMark>
      <SliderMark value={6} mt={3} ml="-1" fontSize="sm">
        6
      </SliderMark>
      <SliderMark
        value={sliderValue}
        textAlign="center"
        fontSize={'sm'}
        bg="brand"
        color="white"
        mt="-2.6rem"
        ml="-70px"
        w="140px"
        padding={'0.25rem 0.5rem'}
        borderRadius={'sm'}
        display={showTooltip ? 'block' : 'none'}
      >
        {sliderValue} {t('settingsPreferences.transfers')}
      </SliderMark>
      <SliderTrack>
        <SliderFilledTrack />
      </SliderTrack>

      <SliderThumb
        boxSize={6}
        aria-aria-labelledby="maxTransfers"
        position={'relative'}
      >
        <Box color="brand" as={FaExchangeAlt} position={'relative'} />
      </SliderThumb>
    </Slider>
  );
}

export default MaxTransfersSlider;
