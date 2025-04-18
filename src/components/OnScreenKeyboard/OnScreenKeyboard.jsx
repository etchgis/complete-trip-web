import 'react-simple-keyboard/build/css/index.css';

import { Box, Flex } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

import Keyboard from 'react-simple-keyboard';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../context/RootStore';

const OnScreenKeyboard = observer(() => {
  const [layout, setLayout] = useState('default');
  const [layoutType, setLayoutType] = useState('default');
  const store = useStore();
  const { onScreenKeyboardInput, setKeyboardInputValue, activeInput, keyBoardType, setKeyboardActiveInput } =
    store.uiStore;
  const keyboard = useRef();

  const handleShift = () => {
    const newLayoutName = layout === 'default' ? 'shift' : 'default';
    setLayout(newLayoutName);
  };

  const onKeyPress = button => {
    if (button === '{shift}' || button === '{lock}') {
      handleShift();
      return;
    }

    // Check if we should replace the entire input on this keystroke
    if (keyboard.current && keyboard.current.replaceEntireInputOnNextKeystroke) {
      if (button.length === 1 || /^\d$/.test(button)) {
        setKeyboardInputValue(button);
        keyboard.current.setInput(button);
        keyboard.current.replaceEntireInputOnNextKeystroke = false;
        return;
      }
    }
  };

  const onInputChange = input => {
    setKeyboardInputValue(input);

    if (keyboard.current) keyboard.current.setInput(input);

    // Auto-advance to next field when maximum length is reached
    const maxLength = getMaxLength();
    if (maxLength && input.length >= maxLength) {
      const fieldSequence = ['pin', 'areaCode', 'phone1', 'phone2'];
      const currentIndex = fieldSequence.indexOf(activeInput);
      if (currentIndex >= 0 && currentIndex < fieldSequence.length - 1) {
        const nextField = fieldSequence[currentIndex + 1];
        // Use a small delay to ensure the current input is processed first
        setTimeout(() => {
          setKeyboardActiveInput(nextField);
        }, 100);
      }
    }
  };

  useEffect(() => {
    if (keyboard.current) {
      keyboard.current.setInput(onScreenKeyboardInput[activeInput] || '');
    }
  }, [onScreenKeyboardInput, activeInput]);

  useEffect(() => {
    if (keyboard.current) {
      // If we've returned to a field that already has a value, set a flag to check next input
      const oldValue = onScreenKeyboardInput[activeInput] || '';
      if (oldValue.length > 0) {
        keyboard.current.replaceEntireInputOnNextKeystroke = true;
      } else {
        keyboard.current.replaceEntireInputOnNextKeystroke = false;
      }
    }
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
