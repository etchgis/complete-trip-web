import { Box, useRadio } from '@chakra-ui/react';

import useTranslation from '../../models/useTranslation';

function RadioCard(props) {
  const { getInputProps, getRadioProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getRadioProps();
  const { t } = useTranslation();

  return (
    <Box as="label">
      <input {...input} aria-label={input.value} />
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
        {props.children.toLowerCase() === 'yes'
          ? t('global.yes')
          : t('global.no')}
      </Box>
    </Box>
  );
}

export default RadioCard;
