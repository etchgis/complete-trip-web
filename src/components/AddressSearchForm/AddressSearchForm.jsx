import { Autocomplete, Item } from './Autocomplete';

import { observer } from 'mobx-react-lite';
import { useAsyncList } from 'react-stately';
import { useEffect } from 'react';
import { useState } from 'react';
import { useStore } from '../../context/RootStore';

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
  }) => {
    const [address, setAddress] = useState(defaultAddress || '');
    const { locations } = useStore().favorites;

    // console.log({ address });
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

        let uri = `https://511ny.etch.app/geocode?query=${encodeURIComponent(
          filterText
        )}&limit=10`;

        if (center?.lng) {
          uri += `&center=${(center.lng * 1000 || 0) / 1000},${(center.lat * 1000 || 0) / 1000
            }`;
        }
        // console.log(uri);
        let items = await fetch(cursor || uri, { signal }).then(res =>
          res.json()
        );

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

        // console.log({ items });

        return {
          items: unique,
          // cursor: json.next,
        };
      },
    });

    return (
      <Autocomplete
        required={required || false}
        label={label}
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
          console.log('[address search form] onselectionchange');
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
        {item => (
          <Item key={item.childKey} favorite={item.alias ? true : false}>
            {item?.name}
          </Item>
        )}
      </Autocomplete>
    );
  }
);