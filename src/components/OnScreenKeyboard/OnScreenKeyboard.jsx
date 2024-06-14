import 'react-simple-keyboard/build/css/index.css';

import { Box, Flex } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

import Keyboard from 'react-simple-keyboard';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../context/RootStore';

const OnScreenKeyboard = observer(() => {
  const [layout, setLayout] = useState('default');
  const [layoutType, setLayoutType] = useState('default');
  const { onScreenKeyboardInput, setKeyboardInputValue, activeInput, keyBoardType } =
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
    // console.log(input, layoutType, typeof input);
    // console.log('input', input, layoutType, typeof input, isNaN(input), activeInput);
    // if (layoutType === 'numeric' && !isNaN(input)) {
    //   console.log('SET NUMERIC', input);
    setKeyboardInputValue(input);
    // if (keyboard.current) keyboard.current.setInput(input);
    // }
    // else if (layoutType === 'default') {
    //   console.log('SET ALPHA', input);
    //   setKeyboardInputValue(input);
    //   // if (keyboard.current) keyboard.current.setInput(input);
    // }
    if (keyboard.current) keyboard.current.setInput(input);
  };

  useEffect(() => {
    if (keyboard.current) {
      console.log('onScreenKeyboardInput', onScreenKeyboardInput[activeInput]);
      keyboard.current.setInput(onScreenKeyboardInput[activeInput] || '');
    }
  }, [onScreenKeyboardInput]);

  useEffect(() => {
    if (keyboard.current) keyboard.current.setInput('');
  }, [activeInput]);

  useEffect(() => {
    setLayoutType(keyBoardType);
  }, [keyBoardType]);

  const getMaxLength = () => {
    if (activeInput === 'pin' || activeInput === 'phone2') {
      return 4;
    }
    else if (activeInput === 'areaCode' || activeInput === 'phone1') {
      return 3;
    }
    return null;
  }

  return (
    <Flex
      data-test-id="keyboard"
      position="absolute"
      right="0"
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
          inputPattern={keyBoardType === 'numeric' ? /^[0-9]*$/ : null}
          maxLength={getMaxLength()}
        />
      </Box>
    </Flex>
  );
});

export default OnScreenKeyboard;
