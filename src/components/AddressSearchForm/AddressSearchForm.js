import { Autocomplete, Item } from './Autocomplete';

import { useAsyncList } from 'react-stately';
import { useEffect } from 'react';
import { useState } from 'react';

export const SearchForm = ({
  saveAddress,
  center,
  defaultAddress,
  setGeocoderResult,
  name,
  label,
  required,
  clearResult,
}) => {
  const [address, setAddress] = useState(defaultAddress || '');
  // console.log({ address });
  useEffect(() => {
    saveAddress(address);
  }, [address, saveAddress]);

  useEffect(() => {
    setAddress(defaultAddress);
    // eslint-disable-next-line
  }, []);

  let list = useAsyncList({
    async load({ signal, cursor, filterText }) {
      if (!filterText || filterText.length < 2) return { items: [] };
      if (cursor) {
        cursor = cursor.replace(/^http:\/\//i, 'https://');
      }

      let uri = `https://511ny.etch.app/geocode?query=${encodeURIComponent(
        filterText
      )}&limit=10`;

      if (center?.lng) {
        uri += `&center=${(center.lng * 1000 || 0) / 1000},${
          (center.lat * 1000 || 0) / 1000
        }`;
      }
      // console.log(uri);
      let items = await fetch(cursor || uri, { signal }).then(res =>
        res.json()
      );

      const keys = [];
      const unique = [];

      items.forEach(item => {
        if (
          !item.childKey ||
          !item.title ||
          !item.description ||
          keys.includes(item.childKey)
        )
          return;
        keys.push(item.childKey);
        item['name'] = item?.title + ', ' + item?.description;
        unique.push(item);
      });

      // console.log(items);

      return {
        items: items,
        // cursor: json.next,
      };
    },
  });

  return (
    <Autocomplete
      required={required || false}
      label={label || 'Home Address'}
      placeholder="Start typing an address..."
      items={list.items}
      inputValue={address}
      onInputChange={e => {
        // console.log('onchange');
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
        // console.log('onselectionchange');
        if (!item) {
          return;
        }
        setAddress(list.items.filter(e => e.childKey === item)[0].name);
        setGeocoderResult(list.items.find(e => e.childKey === item));
      }}
      loadingState={list.loadingState}
      onLoadMore={list.loadMore}
      name={name || 'address'}
    >
      {item => <Item key={item.childKey}>{item?.name}</Item>}
    </Autocomplete>
  );
};
