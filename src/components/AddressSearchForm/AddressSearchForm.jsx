import { Autocomplete, Item } from './Autocomplete';
import { useEffect, useRef, useState } from 'react';

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
    defaultGeocoderResult,
    setGeocoderResult,
    name,
    label,
    required,
    clearResult,
    resultsMaxWidth,
    inputName,
    autoFocus,
  }) => {
    const [address, setAddress] = useState(defaultAddress || '');
    const { locations } = useStore().favorites;
    const {
      onScreenKeyboardInput,
      setKeyboardInputValue,
      ux,
      activeInput,
      setKeyboardActiveInput,
      getKeyboardInputValue,
    } = useStore().uiStore;
    const { t } = useTranslation();

    useEffect(() => {
      if (saveAddress) saveAddress(address);
    }, [address, saveAddress]);

    useEffect(() => {
      setAddress(defaultAddress);
      // If we have a default geocoder result, set it immediately
      if (defaultGeocoderResult && defaultGeocoderResult.text) {
        setGeocoderResult(defaultGeocoderResult);
      }
      // eslint-disable-next-line
    }, [defaultAddress, defaultGeocoderResult]);

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
          // console.log(unique[0]);
          console.log('geocoder result');
          // console.log(unique[0]?.title);
        }

        return {
          items: unique,
          // cursor: json.next,
        };
      },
    });

    /*KEYBOARD*/

    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
      if (ux !== 'kiosk') return;
      console.log('[addressSearchForm] setting address');
      if (inputName !== activeInput) return;
      setShowResults(true);
      setAddress(getKeyboardInputValue(inputName));
    }, [onScreenKeyboardInput, ux]);

    useEffect(() => {
      if (ux !== 'kiosk') return;
      if (!address) {
        list.setFilterText('');
        setShowResults(false);
        if (defaultAddress && clearResult) {
          setGeocoderResult({});
        }
        return;
      }
      list.setFilterText(address);
    }, [address]);

    return (
      <Autocomplete
        // KEYBOARD
        showResults={showResults}
        onFocus={() => setKeyboardActiveInput(inputName)}
        inputName={inputName}
        activeInput={activeInput}
        autoFocus={autoFocus}
        //END KEYBOARD
        required={required || false}
        placeholder={t('map.searchPlaceholder')}
        label={label}
        aria-label={label}
        items={list.items}
        inputValue={address}
        data-testid="address-search"
        onInputChange={e => {
          console.log('[addressSearchForm] onInputChange');
          list.setFilterText(e);
          if (!list.selectedKeys.size) {
            setShowResults(false);
            //NOTE needed so that when we come back we clear out the result if the user changes the input value
            //NOTE not sure how this will affect the other places where the input is so adding a check here
            if (defaultAddress && clearResult) {
              setGeocoderResult({});
            }
            setShowResults(true);
            setAddress(e);
          } else {
            setShowResults(false);
            setAddress('');
          }
        }}
        onSelectionChange={item => {
          console.log('[address search form] onselectionchange');
          if (!item) {
            return;
          }
          document.activeElement.blur();
          const selected = list.items.find(e => e.childKey === item);
          console.log({ selected });
          if (selected?.name) {
            setAddress(selected?.name);
            setShowResults(false);
            setGeocoderResult(list.items.find(e => e.childKey === item));
            return;
          }
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
    );
  }
);
