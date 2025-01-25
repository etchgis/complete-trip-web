import { HStack, Input } from '@chakra-ui/react';
import { useState } from 'react';

const AlphanumericPinInput = ({ onChange }) => {
  const [pin, setPin] = useState(['', '', '', '', '', '']);

  const handleInputChange = (value, index) => {
    if (/^[a-zA-Z0-9]*$/.test(value)) { // Allow only alphanumeric characters
      const newPin = [...pin];
      newPin[index] = value;
      setPin(newPin);
      onChange(newPin);
    }
  };

  return (
    <HStack spacing={4}>
      {pin.map((value, index) => (
        <Input
          key={index}
          value={value}
          maxLength={1}
          textAlign="center"
          onChange={(e) => handleInputChange(e.target.value, index)}
        />
      ))}
    </HStack>
  );
};


export default AlphanumericPinInput;
