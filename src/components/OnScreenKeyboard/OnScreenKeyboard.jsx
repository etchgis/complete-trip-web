import 'react-simple-keyboard/build/css/index.css';

import { Box, Flex, Button } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

import Keyboard from 'react-simple-keyboard';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../context/RootStore';

// Define only the custom numeric layout
const numericLayout = {
  default: [
    '1 2 3',
    '4 5 6',
    '7 8 9',
    '{clear} 0 {bksp}'
  ]
};

let inputAccumulator = {};

const OnScreenKeyboard = observer(() => {
  const [layout, setLayout] = useState('default');
  const [layoutType, setLayoutType] = useState('default');
  const [shouldReplaceInput, setShouldReplaceInput] = useState(false);
  const store = useStore();
  const { onScreenKeyboardInput, setKeyboardInputValue, activeInput, keyBoardType, setKeyboardActiveInput } =
    store.uiStore;
  const keyboard = useRef();
  
  // Track toggle button interaction to prevent hiding when clicking
  const [isTogglingCheckbox, setIsTogglingCheckbox] = useState(false);

  // Handle global focus changes to track when focus leaves a checkbox or interactive element
  useEffect(() => {
    const handleFocusChange = () => {
      // Don't clear focus during a toggle operation
      if (isTogglingCheckbox) {
        return;
      }

      // Check if new focused element is a checkbox, the swap button, or the toggle button
      const activeElement = document.activeElement;
      const isCheckbox = activeElement?.id?.startsWith('mode-checkbox-');
      const isSwapButton = activeElement?.id === 'swap-locations-button';
      const isToggleButton = activeElement?.closest?.('[data-test-id="toggle-checkbox-button"]');

      if (isSwapButton && !store.uiStore.focusedCheckbox) {
        store.uiStore.setFocusedCheckbox('swap-locations-button');
      } else if (!isCheckbox && !isSwapButton && !isToggleButton && store.uiStore.focusedCheckbox) {
        setTimeout(() => {
          store.uiStore.setFocusedCheckbox(null);
        }, 0);
      }
    };

    // Listen for focus changes throughout the document
    document.addEventListener('focusin', handleFocusChange);

    return () => {
      document.removeEventListener('focusin', handleFocusChange);
    };
  }, [store.uiStore, isTogglingCheckbox]);

  useEffect(() => {
    Object.keys(onScreenKeyboardInput).forEach(key => {
      if (inputAccumulator[key] === undefined) {
        inputAccumulator[key] = onScreenKeyboardInput[key] || '';
      }
    });

    inputAccumulator[activeInput] = onScreenKeyboardInput[activeInput] || '';
  }, [onScreenKeyboardInput, activeInput]);

  const handleShift = () => {
    // Only toggle shift in default keyboard mode
    if (layoutType === 'default') {
      const newLayoutName = layout === 'default' ? 'shift' : 'default';
      setLayout(newLayoutName);
    }
  };

  const onKeyPress = button => {
    if (button === '{shift}' || button === '{lock}') {
      handleShift();
      return;
    }

    // Handle spacebar for checkboxes or other interactive elements like the swap button
    if (button === '{space}' && store.uiStore.focusedCheckbox) {
      handleToggleCheckbox();
      return;
    }

    let currentValue = inputAccumulator[activeInput] || '';

    // Special handling for date input
    if (activeInput === 'date') {
      if (button === '{bksp}') {
        // Remove the last character
        currentValue = currentValue.slice(0, -1);
      } else if (button === '{clear}') {
        // Clear the field
        currentValue = '';
      } else if (/^\d$/.test(button)) {
        // For date input, handle auto-formatting and validation (YYYY-MM-DD)
        if (shouldReplaceInput) {
          currentValue = button;
          setShouldReplaceInput(false);
        } else {
          // Initialize with current date if empty
          if (currentValue.length === 0) {
            const today = new Date();
            const year = today.getFullYear();
            // Set first digit of year and continue
            currentValue = year.toString().substring(0, 3) + button;
          } else if (currentValue.length === 4) {
            // After year, add dash and first digit of month
            // Ensure month starts with 0 or 1
            if (button > 1) {
              currentValue += '-0' + button;
            } else {
              currentValue += '-' + button;
            }
          } else if (currentValue.length === 6 && currentValue[5] === '1') {
            // Second digit of month when first digit is 1
            // Ensure month is 10, 11, or 12
            if (button > 2) {
              currentValue = currentValue.slice(0, 5) + '0-0' + button;
            } else {
              currentValue += button + '-';
            }
          } else if (currentValue.length === 6 && currentValue[5] === '0') {
            // Second digit of month when first digit is 0
            // Ensure month is 01-09
            if (button === '0') {
              currentValue = currentValue.slice(0, 5) + '1-01';
            } else {
              currentValue += button + '-';
            }
          } else if (currentValue.length === 8) {
            // First digit of day
            // Ensure day starts with 0, 1, 2, or 3
            if (button > 3) {
              currentValue += '0' + button;
            } else {
              currentValue += button;
            }
          } else if (currentValue.length === 9 && currentValue[8] === '3') {
            // Second digit of day when first digit is 3
            // Ensure day is 30 or 31
            if (button > 1) {
              currentValue = currentValue.slice(0, 8) + '0' + button;
            } else {
              currentValue += button;
            }
          } else if (currentValue.length === 9 && currentValue[8] === '0') {
            // Second digit of day when first digit is 0
            // Ensure day is not 00
            if (button === '0') {
              currentValue = currentValue.slice(0, 8) + '01';
            } else {
              currentValue += button;
            }
          } else {
            currentValue += button;
          }
        }
      }
    }
    // Special handling for time input
    else if (activeInput === 'time') {
      if (button === '{bksp}') {
        // Remove the last character
        currentValue = currentValue.slice(0, -1);
      } else if (button === '{clear}') {
        // Clear the field
        currentValue = '';
      } else if (/^\d$/.test(button)) {
        // For time input, handle auto-formatting and validation (HH:MM)
        if (shouldReplaceInput) {
          // For first input, validate hour range
          if (button > 2) {
            currentValue = '0' + button;
          } else {
            currentValue = button;
          }
          setShouldReplaceInput(false);
        } else {
          if (currentValue.length === 0) {
            // First digit of hour
            if (button > 2) {
              currentValue = '0' + button;
            } else {
              currentValue = button;
            }
          } else if (currentValue.length === 1) {
            // Second digit of hour
            if (currentValue === '2' && button > 3) {
              // If first digit is 2, second can only be 0-3 (max 23 hours)
              currentValue = '0' + currentValue + ':0' + button;
            } else {
              currentValue += button;
            }
          } else if (currentValue.length === 2) {
            // After hour, add colon and ensure minute starts with valid digit
            if (button > 5) {
              currentValue += ':0' + button;
            } else {
              currentValue += ':' + button;
            }
          } else if (currentValue.length === 4) {
            // Last digit of minutes
            currentValue += button;
          }
        }
      }
    }
    // Default handling for other inputs
    else {
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
    }

    inputAccumulator[activeInput] = currentValue;

    setKeyboardInputValue(currentValue);

    if (keyboard.current) {
      keyboard.current.setInput(currentValue);
    }

    // Auto-advance to next field when maximum length is reached
    const maxLength = getMaxLength();
    if (maxLength && currentValue.length >= maxLength) {
      const getFieldSequence = () => {
        // Different field sequences for different contexts
        if (activeInput === 'date' || activeInput === 'time') {
          return ['date', 'time'];
        }
        return ['pin', 'areaCode', 'phone1', 'phone2'];
      };

      const fieldSequence = getFieldSequence();
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

    // Reset to default layout when switching keyboard types
    if (keyBoardType === 'numeric') {
      setLayout('default');
    }
  }, [keyBoardType]);

  const getMaxLength = () => {
    if (activeInput === 'pin' || activeInput === 'phone2') {
      return 4;
    }
    else if (activeInput === 'areaCode' || activeInput === 'phone1') {
      return 3;
    }
    else if (activeInput === 'date') {
      return 10; // YYYY-MM-DD format has 10 characters
    }
    else if (activeInput === 'time') {
      return 5; // HH:MM format has 5 characters
    }
    return null;
  }

  const handleToggleCheckbox = () => {
    setIsTogglingCheckbox(true);

    store.uiStore.toggleFocusedCheckbox();

    // Reset the toggling flag after a delay
    setTimeout(() => {
      setIsTogglingCheckbox(false);
    }, 500);
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
      {/* Toggle Button for Checkboxes/Buttons - Only shows when a focusable element is focused */}
      {store.uiStore.focusedCheckbox && (
        <Button
          onClick={handleToggleCheckbox}
          colorScheme="blue"
          size="lg"
          borderRadius="full"
          boxShadow="md"
          position="absolute"
          top="-55px"
          left="50%"
          transform="translateX(-50%)"
          width="80%"
          maxW="800px"
          fontWeight="bold"
          aria-label="Toggle Selection"
          data-test-id="toggle-checkbox-button"
          height="50px"
          zIndex="1501"
        >
          {store.uiStore.focusedCheckbox === 'swap-locations-button' ? 'Swap Locations' : 'Toggle Selection'}
        </Button>
      )}

      {/* Keyboard */}
      <Box w="100%" maxW="800px">
        <Keyboard
          keyboardRef={r => (keyboard.current = r)}
          // Only provide a custom layout for numeric mode
          layout={layoutType === 'numeric' ? numericLayout : null}
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
