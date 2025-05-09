import 'react-simple-keyboard/build/css/index.css';

import { Box, Flex } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

import Keyboard from 'react-simple-keyboard';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../context/RootStore';

let inputAccumulator = {};

const OnScreenKeyboard = observer(() => {
  const [layout, setLayout] = useState('default');
  const [layoutType, setLayoutType] = useState('default');
  const [shouldReplaceInput, setShouldReplaceInput] = useState(false);
  const store = useStore();
  const { onScreenKeyboardInput, setKeyboardInputValue, activeInput, keyBoardType, setKeyboardActiveInput } =
    store.uiStore;
  const keyboard = useRef();

  useEffect(() => {
    Object.keys(onScreenKeyboardInput).forEach(key => {
      if (inputAccumulator[key] === undefined) {
        inputAccumulator[key] = onScreenKeyboardInput[key] || '';
      }
    });

    inputAccumulator[activeInput] = onScreenKeyboardInput[activeInput] || '';
  }, [onScreenKeyboardInput, activeInput]);

  const handleShift = () => {
    const newLayoutName = layout === 'default' ? 'shift' : 'default';
    setLayout(newLayoutName);
  };

  const onKeyPress = button => {
    if (button === '{shift}' || button === '{lock}') {
      handleShift();
      return;
    }

    let currentValue = inputAccumulator[activeInput] || '';

    // Check if we should replace the entire input on the first keystroke
    if (shouldReplaceInput && button.length === 1) {
      // For character keys when shouldReplaceInput is true, replace the entire input
      currentValue = button;
      setShouldReplaceInput(false);
    } else {
      if (button === '{bksp}') {
        // Remove the last character
        currentValue = currentValue.slice(0, -1);
      } else if (button === '{space}') {
        // Add a space
        currentValue += ' ';
      } else if (button === '{enter}') {
        // No special handling for enter
        return;
      } else if (button === '{clear}') {
        // Clear the field
        currentValue = '';
      } else if (button.length === 1 || /^\d$/.test(button)) {
        // For regular characters, just append
        currentValue += button;
      }
    }

    inputAccumulator[activeInput] = currentValue;

    setKeyboardInputValue(currentValue);

    if (keyboard.current) {
      keyboard.current.setInput(currentValue);
    }

    // Auto-advance to next field when maximum length is reached
    const maxLength = getMaxLength();
    if (maxLength && currentValue.length >= maxLength) {
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
      const currentValue = inputAccumulator[activeInput] || '';
      keyboard.current.setInput(currentValue);

      // If the field already has a value, set the flag to replace it on first keystroke
      if (currentValue.length > 0) {
        setShouldReplaceInput(true);
      } else {
        setShouldReplaceInput(false);
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
          // default or shift
          layoutName={layout}
          onKeyPress={onKeyPress}
          // Disable highlighting of keys
          physicalKeyboardHighlight={false}
          // Prevent the keyboard from trying to sync with other keyboard instances
          syncInstanceInputs={false}
          // Prevent the keyboard from attempting to position the cursor in the input
          disableCaretPositioning={true}
          // Prevent default mouse behavior on keyboard buttons
          preventMouseDownDefault={true}
          // Use HTML button elements instead of divs for better accessibility
          useButtonTag={true}
          // Merge display of multiple layouts (important for handling special keys consistently)
          mergeDisplay={true}
          inputName={activeInput}
          inputPattern={keyBoardType === 'numeric' ? /^[0-9]*$/ : null}
          maxLength={getMaxLength()}
        />
      </Box>
    </Flex>
  );
});

export default OnScreenKeyboard;
