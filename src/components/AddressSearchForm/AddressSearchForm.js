import { Autocomplete, Item } from './Autocomplete';

import { useAsyncList } from 'react-stately';
import { useEffect } from 'react';
import { useState } from 'react';

export const SearchForm = ({
  saveAddress,
  center,
  defaultAddress,
  setGeocoderResult,
}) => {
  const [address, setAddress] = useState(defaultAddress || '');

  useEffect(() => {
    saveAddress(address);
  }, [address, saveAddress]);

  useEffect(() => {
    setAddress(defaultAddress);
    // eslint-disable-next-line
  }, []);

  let list = useAsyncList({
    async load({ signal, cursor, filterText }) {
      if (!filterText || filterText.length < 3) return { items: [] };
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

      console.log(items);

      return {
        items: items,
        // cursor: json.next,
      };
    },
  });

  return (
    <Autocomplete
      label="Home Address"
      placeholder="Start typing an address..."
      items={list.items}
      inputValue={address || list.filterText}
      onInputChange={e => {
        list.setFilterText(e);
        console.log(list);
        if (!list.selectedKeys.length) {
          setAddress(e);
        } else {
          setAddress('');
        }
      }}
      onSelectionChange={item => {
        if (!item) return;
        setAddress(list.items.filter(e => e.childKey === item)[0]?.title);
        setGeocoderResult(list.items.find(e => e.childKey === item));
      }}
      loadingState={list.loadingState}
      onLoadMore={list.loadMore}
      name="address"
    >
      {item => <Item key={item.childKey}>{item?.name}</Item>}
    </Autocomplete>
  );
};
