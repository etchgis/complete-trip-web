import * as React from 'react';

import {
  Box,
  FormLabel,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Spinner,
} from '@chakra-ui/react';
import { useComboBox, useFilter } from 'react-aria';

import { ListBox } from './ListBox';
import { Popover } from './Popover';
import { Search2Icon } from '@chakra-ui/icons';
import { useComboBoxState } from 'react-stately';

export { Item, Section } from 'react-stately';

export const Autocomplete = () => {
  let { contains } = useFilter({ sensitivity: 'base' });
  let state = useComboBoxState({ ...props, defaultFilter: contains });

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

  return (
    <Box display="inline-block" position="relative">
      <FormLabel {...labelProps}>{props.label}</FormLabel>
      <InputGroup>
        <InputLeftElement>
          <Search2Icon color="gray.500" />
        </InputLeftElement>
        <Input {...inputProps} ref={inputRef} size="md" />
        <InputRightElement>
          {props.loadingState === 'loading' ||
          props.loadingState === 'filtering' ? (
            <Spinner color="blue.400" size="sm" />
          ) : null}
        </InputRightElement>
      </InputGroup>
      {state.isOpen && (
        <Popover
          popoverRef={popoverRef}
          triggerRef={inputRef}
          state={state}
          isNonModal
          placement="bottom start"
        >
          <ListBox
            {...listBoxProps}
            listBoxRef={listBoxRef}
            state={state}
            loadingState={props.loadingState}
            onLoadMore={props.onLoadMore}
          />
        </Popover>
      )}
    </Box>
  );
};
