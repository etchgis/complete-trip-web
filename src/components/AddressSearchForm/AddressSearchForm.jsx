import 'react-simple-keyboard/build/css/index.css';

import { Autocomplete, Item } from './Autocomplete';
import { Box, Flex } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

import Keyboard from 'react-simple-keyboard';
import { add } from 'lodash';
import config from '../../config';
import { observer } from 'mobx-react-lite';
import { useAsyncList } from 'react-stately';
import { useStore } from '../../context/RootStore';
import useTranslation from '../../models/useTranslation';

export const SearchForm = observer(
  ({
    saveAddress,
    center,
    defaultAddress,
    setGeocoderResult,
    name,
    label,
    required,
    clearResult,
    resultsMaxWidth,
  }) => {
    const [address, setAddress] = useState(defaultAddress || '');
    const { locations } = useStore().favorites;
    const { t } = useTranslation();

    useEffect(() => {
      if (saveAddress) saveAddress(address);
    }, [address, saveAddress]);

    useEffect(() => {
      setAddress(defaultAddress);
      // eslint-disable-next-line
    }, [defaultAddress]);

    let list = useAsyncList({
      async load({ signal, cursor, filterText }) {
        //TODO show favs on focus
        if (!filterText || filterText.length < 2) return { items: [] };
        if (cursor) {
          cursor = cursor.replace(/^http:\/\//i, 'https://');
        }

        let uri = `${config.SERVICES.geocode}/?query=${encodeURIComponent(
          filterText
        )}&limit=10&org=${config.ORGANIZATION}`;

        if (center?.lng) {
          uri += `&center=${(center.lng * 1000 || 0) / 1000},${
            (center.lat * 1000 || 0) / 1000
          }`;
        }
        // console.log(uri);
        const Items = await fetch(cursor || uri, { signal }).then(res =>
          res.json()
        );
        // console.log({ Items });
        let items = [];
        if (Items.length) {
          items = Items.filter(item => !item.venueId);
        }
        // console.log({ items });
        const keys = [];

        if (locations.length)
          locations.forEach(l => {
            l['childKey'] = l.id.toString();
            l['name'] = l.alias;
            l['search'] = l.text.toLowerCase() + ' | ' + l.alias.toLowerCase();
          });
        const regex = new RegExp(filterText.toLowerCase().trim());
        const unique = locations.length
          ? locations.filter(l => regex.test(l.search))
          : [];

        items.forEach(item => {
          if (item?.description && item?.locality) {
            item.description += ', ' + item.locality;
          }
          if (!item.description && item?.locality)
            item.description = item.locality;
          if (
            !item.childKey ||
            !item.title ||
            !item.description ||
            keys.includes(item.childKey)
          )
            return;
          keys.push(item.childKey);
          item['name'] = item?.title + ', ' + item?.description;
          item['text'] = item?.title + ', ' + item?.description;
          unique.push(item);
        });

        if (unique.length > 0) {
          console.log(unique[0]);
          console.log('geocoder result');
          console.log(unique[0]?.title);
        }

        return {
          items: unique,
          // cursor: json.next,
        };
      },
    });

    /*KEYBOARD*/

    const [layout, setLayout] = useState('default');
    const [showKeyboard, setShowKeyboard] = useState(false);
    const [hasSelected, setHasSelected] = useState(false);
    const [hideKeyboardTimeoutId, setTimeoutId] = useState(null);

    const keyboard = useRef();
    const inputRef = useRef();

    const handleShift = () => {
      const newLayoutName = layout === 'default' ? 'shift' : 'default';
      setLayout(newLayoutName);
    };

    const onKeyPress = button => {
      if (button === '{shift}' || button === '{lock}') handleShift();
    };

    // const onChangeInput = event => {
    //   setAddress(event.target.value);
    //   keyboard.current.setInput(event.target.value);
    // };

    useEffect(() => {
      if (hasSelected) {
        setShowKeyboard(false);
      }
    }, [hasSelected]);

    useEffect(() => {
      setHasSelected(false);
      clearTimeout(hideKeyboardTimeoutId);
      console.log('useEffect onchange');
      keyboard.current.setInput(address);
      if (!address) {
        list.setFilterText('');
        if (defaultAddress && clearResult) {
          setGeocoderResult({});
        }
        return;
      }
      list.setFilterText(address);
      setTimeout(() => {
        if (hasSelected || !address.length) return;
        inputRef.current.focus();
      }, 100);
    }, [address]);

    useEffect(() => {
      console.log({ showKeyboard });
    }, [showKeyboard]);

    const onBlurHideKeyboard = () => {
      setTimeoutId(
        setTimeout(() => {
          setShowKeyboard(false);
          inputRef.current.blur();
        }, 5000)
      );
    };

    return (
      <>
        {/* KEYBOARD */}
        <Flex
          display={showKeyboard ? 'flex' : 'none'}
          data-test-id="keyboard"
          position="absolute"
          bottom="0"
          left="0"
          zIndex="10"
          width="100%"
          height={'305px'}
          background={'#ececec'}
          alignContent={'center'}
          justifyContent={'center'}
          py={'40px'}
          boxShadow={'0 -5px 5px -5px #999'}
          borderRadius={0}
        >
          <Box w="100%" maxW="1000px">
            <Keyboard
              keyboardRef={r => (keyboard.current = r)}
              layoutName={layout}
              onChange={e => setAddress(e)}
              onKeyPress={onKeyPress}
            />
          </Box>
        </Flex>
        {/* END KEYBOARD */}
        <Autocomplete
          // KEYBOARD
          onFocus={() => setShowKeyboard(true)}
          onBlur={onBlurHideKeyboard}
          showKeyboard={showKeyboard}
          inputRef={inputRef}
          // END KEYBOARD

          required={required || false}
          placeholder={t('map.searchPlaceholder')}
          label={label}
          aria-label={label}
          items={list.items}
          inputValue={address}
          data-testid="address-search"
          onInputChange={e => {
            console.log('[addressSearchForm] onchange');
            list.setFilterText(e);
            if (!list.selectedKeys.size) {
              //NOTE needed so that when we come back we clear out the result if the user changes the input value
              //NOTE not sure how this will affect the other places where the input is so adding a check here
              if (defaultAddress && clearResult) {
                setGeocoderResult({});
              }
              setAddress(e);
            } else {
              setAddress('');
            }
          }}
          onSelectionChange={item => {
            console.log('[address search form] onselectionchange');
            if (!item) {
              return;
            }
            document.activeElement.blur();
            setAddress(list.items.filter(e => e.childKey === item)[0].name);
            setGeocoderResult(list.items.find(e => e.childKey === item));
            setHasSelected(true);
          }}
          loadingState={list.loadingState}
          onLoadMore={list.loadMore}
          name={name || 'address'}
          resultsMaxWidth={resultsMaxWidth}
        >
          {item => (
            <Item
              key={item.childKey}
              favorite={item.alias ? true : false}
              aria-label={item?.name}
            >
              {item?.name}
            </Item>
          )}
        </Autocomplete>
      </>
    );
  }
);
/*        <Box
          display={showKeyboard ? 'box' : 'none'}
          data-test-id="keyboard"
          position="absolute"
          bottom="0px"
          left="500px"
          zIndex="1"
          width="calc(100% - 500px)"
          maxW={'1420'}
          height={'265px'}
          background={'#ececec'}
        >
          <Flex alignContent={'center'} justifyContent={'center'}>
            <Keyboard
              keyboardRef={r => (keyboard.current = r)}
              layoutName={layout}
              onChange={onChange}
              onKeyPress={onKeyPress}
              height="300px"
            />
          </Flex>
        </Box> */
