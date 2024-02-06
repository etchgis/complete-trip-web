import * as React from 'react';

import {
  FormControl,
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
import translator from '../../models/translator';
import { useComboBoxState } from 'react-stately';

export { Item, Section } from 'react-stately';

export const Autocomplete = props => {
  const { t } = translator;
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

  return (
    <FormControl
      display="inline-block"
      position="relative"
      width="100%"
      isRequired={props.required}
    >
      {props.label ? (
        <FormLabel {...labelProps}>{t('map.searchTitle')} </FormLabel>
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
        />
        <InputRightElement aria-hidden={true}>
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
          maxWidth={props.resultsMaxWidth || '465px'}
        >
          <ListBox
            {...listBoxProps}
            listBoxRef={listBoxRef}
            state={state}
            loadingState={props.loadingState}
            onLoadMore={props.onLoadMore}
            width="100%"
          />
        </Popover>
      )}
    </FormControl>
  );
};
