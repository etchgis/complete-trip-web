import * as React from 'react';

import { CloseIcon, Search2Icon } from '@chakra-ui/icons';
import {
  FormControl,
  FormLabel,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Spinner,
} from '@chakra-ui/react';
import { useComboBox, useFilter } from 'react-aria';

import { ListBox } from './ListBox';
import { Popover } from './Popover';
import { observer } from 'mobx-react-lite';
import { useComboBoxState } from 'react-stately';
import { useStore } from '../../context/RootStore';

export { Item, Section } from 'react-stately';

export const Autocomplete = observer(props => {
  const ui = useStore().uiStore;

  let { contains } = useFilter({ sensitivity: 'base' });

  let state = useComboBoxState({
    ...props,
    defaultFilter: contains,
    allowsCustomValue: true,
  });

  let inputRef = React.useRef(null);
  let listBoxRef = React.useRef(null);
  let popoverRef = React.useRef(null);

  let { inputProps, listBoxProps, labelProps } = useComboBox(
    {
      ...props,
      inputRef,
      listBoxRef,
      popoverRef,
    },
    state
  );

  /*KEYBOARD*/
  // Auto-focus effect for kiosk mode
  React.useEffect(() => {
    if (props.autoFocus && inputRef.current) {
      inputRef.current.focus();
      ui.setKeyboardActiveInput(props.inputName);
    }
  }, [props.autoFocus, props.inputName, ui]);

  React.useEffect(() => {
    // console.log('--------------------');
    // console.log('[autocomplete] useEffect for onScreenKeyboardInput');
    // console.log('showResults', props.showResults);
    // console.log('state open', state.isOpen);
    // console.log('input value', inputRef?.current?.value);
    // console.log('items length', props?.items?.length);
    // console.log('has selection', state);
    // console.log('inputName', props.inputName);
    // console.log('activeInput', props.activeInput);
    // console.log('--------------------');
    if (props.inputName !== props.activeInput) return;
    if (
      props.showResults &&
      !state.isOpen &&
      inputRef?.current?.value &&
      props?.items?.length > 0
    ) {
      state.open();
    } else if (!inputRef?.current?.value || !props?.items?.length) {
      state.close();
    }
  }, [props.showResults, state, inputRef, props.items, props.inputName, props.activeInput]);

  //METHOD TO CLEAR INPUT
  const clearInput = (e) => {
    // Prevent event propagation to ensure the click/touch is handled
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    console.log('[autocomplete] clearing input with setKeyboardInputValue');
    ui.setKeyboardActiveInput(props.inputName);
    ui.setKeyboardInputValue('');
  };

  return (
    <FormControl
      display="inline-block"
      position="relative"
      width="100%"
      isRequired={props.required}
    >
      {props.label ? (
        <FormLabel {...labelProps}>{props.label} </FormLabel>
      ) : null}
      <InputGroup>
        <InputLeftElement>
          <Search2Icon color="gray.600" aria-hidden={true} />
        </InputLeftElement>
        <Input
          {...inputProps}
          ref={inputRef}
          size="md"
          data-testid="address-search-input"
          aria-label={'address search input'}
          type="text"
          autoFocus={props.autoFocus}
        />
        <InputRightElement aria-hidden={true} zIndex={10}>
          {props.loadingState === 'loading' ||
          props.loadingState === 'filtering' ? (
            <Spinner color="blue.400" size="sm" />
          ) : inputRef?.current?.value && ui.ux === 'kiosk' ? (
            <IconButton
              aria-label="clear input"
              onClick={clearInput}
              icon={<CloseIcon />}
              size="sm"
              variant={'ghost'}
              zIndex={10}
              minW="32px"
              minH="32px"
              _hover={{ bg: 'gray.100' }}
              _active={{ bg: 'gray.200' }}
            />
          ) : null}
        </InputRightElement>
      </InputGroup>
      {state.isOpen && props.showResults && (
        <Popover
          popoverRef={popoverRef}
          triggerRef={inputRef}
          state={state}
          isNonModal
          placement="bottom start"
          maxWidth={props.resultsMaxWidth || '465px'}
        >
          <ListBox
            {...listBoxProps}
            listBoxRef={listBoxRef}
            state={state}
            loadingState={props.loadingState}
            onLoadMore={props.onLoadMore}
            width="100%"
            onKeyDown={(e) => {
              // Maintain keyboard focus on the input while the listbox is open (for kiosk mode)
              if (ui.ux === 'kiosk' && props.inputName) {
                ui.setKeyboardActiveInput(props.inputName);
              }
            }}
          />
        </Popover>
      )}
    </FormControl>
  );
});
