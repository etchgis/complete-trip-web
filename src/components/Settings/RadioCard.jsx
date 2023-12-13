import { Box, useRadio } from '@chakra-ui/react';

function RadioCard(props) {
  const { getInputProps, getRadioProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getRadioProps();

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

export default RadioCard;
