import 'react-simple-keyboard/build/css/index.css';

import { Box, Flex } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

import Keyboard from 'react-simple-keyboard';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../context/RootStore';

const OnScreenKeyboard = observer(() => {
  const [layout, setLayout] = useState('default');
  const { onScreenKeyboardInput, setKeyboardInputValue, activeInput } =
    useStore().uiStore;
  const keyboard = useRef();

  const handleShift = () => {
    const newLayoutName = layout === 'default' ? 'shift' : 'default';
    setLayout(newLayoutName);
  };

  const onKeyPress = button => {
    if (button === '{shift}' || button === '{lock}') handleShift();
  };

  const onInputChange = input => {
    console.log(input);
    setKeyboardInputValue(input);
    if (keyboard.current) keyboard.current.setInput(input);
  };

  useEffect(() => {
    if (keyboard.current)
      keyboard.current.setInput(onScreenKeyboardInput[activeInput] || '');
  }, [onScreenKeyboardInput]);

  useEffect(() => {
    if (keyboard.current) keyboard.current.setInput('');
  }, [activeInput]);

  return (
    <Flex
      data-test-id="keyboard"
      // position="absolute"
      bottom="0"
      left="0"
      zIndex="1500"
      width="100%"
      height={'255px'}
      py={4}
      background={'#ececec'}
      alignContent={'center'}
      justifyContent={'center'}
      boxShadow={'0 -5px 5px -5px #999'}
      borderRadius={0}
    >
      <Box w="100%" maxW="800px">
        <Keyboard
          keyboardRef={r => (keyboard.current = r)}
          layoutName={layout}
          onChange={onInputChange}
          onKeyPress={onKeyPress}
          inputName={activeInput}
        />
      </Box>
    </Flex>
  );
});

export default OnScreenKeyboard;
