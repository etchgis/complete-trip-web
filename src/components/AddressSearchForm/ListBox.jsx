import * as React from 'react';

import { Box, List, ListItem, Spinner } from '@chakra-ui/react';
import { useListBox, useOption } from 'react-aria';

import { CheckIcon } from '@chakra-ui/icons';

export function ListBox(props) {
  let ref = React.useRef(null);
  let { listBoxRef = ref, state } = props;
  let { listBoxProps } = useListBox(props, state, listBoxRef);

  // Focus first item when results appear
  React.useEffect(() => {
    if (state.isOpen && state.collection.size > 0) {
      const firstKey = state.collection.getFirstKey();
      if (firstKey && !state.selectionManager.focusedKey) {
        state.selectionManager.setFocusedKey(firstKey);
      }
    }
  }, [state.isOpen, state.collection, state.selectionManager]);

  let onScroll = e => {
    let scrollOffset =
      e.currentTarget.scrollHeight - e.currentTarget.clientHeight * 2;
    if (e.currentTarget.scrollTop > scrollOffset && props.onLoadMore) {
      props.onLoadMore();
    }
  };

  return (
    <List
      {...listBoxProps}
      ref={listBoxRef}
      overflow="auto"
      width="100%"
      maxHeight="300"
      my="1"
      display="flex"
      flexDirection="column"
      onScroll={onScroll}
      data-testid="address-search-results"
    >
      {[...state.collection].map((item, index) => (
        <Option
          key={item.key}
          item={item}
          state={state}
          index={index}
          data-testid="address-search-result"
          aria-label={item?.name}
        />
      ))}
      {props.loadingState === 'loadingMore' && (
        // Display a spinner at the bottom of the list if we're loading more.
        // role="option" is required for valid ARIA semantics since
        // we're inside a role="listbox".
        <Box role="option" pt="4" pb="2" display="flex" justifyContent="center">
          <Spinner color="blue.400" size="sm" />
        </Box>
      )}
    </List>
  );
}

function Option({ item, state, index }) {
  let ref = React.useRef(null);
  let { optionProps, isSelected, isFocused } = useOption(
    {
      key: item.key,
    },
    state,
    ref
  );

  // Scroll into view when focused
  React.useEffect(() => {
    if (isFocused && ref.current) {
      ref.current.focus();
      ref.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [isFocused]);

  return (
    <ListItem
      {...optionProps}
      as="li"
      ref={ref}
      px="2"
      py="2"
      background={isFocused ? 'blue.50' : 'white'}
      color={isFocused ? 'blue.700' : 'gray.700'}
      fontWeight={item?.props?.favorite || isSelected ? 'bold' : 'normal'}
      cursor="pointer"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      aria-label={item?.name}
      tabIndex="0"
      _focus={{
        outline: '2px solid #3182ce',
        outlineOffset: '-2px',
        background: 'blue.50',
        color: 'blue.700'
      }}
      role="option"
      aria-selected={isSelected}
      onFocus={() => {
        if (!isFocused) {
          state.selectionManager.setFocusedKey(item.key);
        }
      }}
      onKeyDown={(e) => {
        // Handle Enter or Space key to select this option
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          state.selectionManager.select(item.key);
        }

        if (e.key === 'Tab') {
          e.preventDefault();
          e.stopPropagation();

          // Find the next/previous item
          const options = [...state.collection];
          let nextIndex;

          if (!e.shiftKey) {
            nextIndex = (index + 1) % options.length;
          } else {
            nextIndex = (index - 1 + options.length) % options.length;
          }

          const nextKey = options[nextIndex].key;
          state.selectionManager.setFocusedKey(nextKey);
          return false;
        }
      }}
    >
      {item.rendered}
      {isSelected && <CheckIcon />}
    </ListItem>
  );
}
