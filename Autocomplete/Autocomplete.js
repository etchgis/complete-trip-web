import { Avatar, Flex, Text } from '@chakra-ui/react';
import Downshift, { useCombobox, useSelect } from 'downshift';
import { useEffect, useState } from 'react';

import { Box } from '@chakra-ui/react';
import { CUIAutoComplete } from 'chakra-ui-autocomplete';

// export const Autocomplete = () => {
//   const [pickerItems, setPickerItems] = useState([]);
//   const [selectedItem, setSelectedItem] = useState();

//   // useEffect(() => {
//   //   (async () => {
//   //     const items = await fetch('https://dummyjson.com/users').then(res =>
//   //       res.json()
//   //     );
//   //     const users = items.users.map(v => {
//   //       v.label = v.firstName + ' ' + v.lastName;
//   //       return v;
//   //     });
//   //     users.map(
//   //       v => (v.value = (v.firstName + ' ' + v.lastName).toLowerCase())
//   //     );
//   //     //get random number bw 0 and 10
//   //     const n = Math.floor(Math.random() * 100);
//   //     setPickerItems(items.users.slice(n, n + 10));
//   //   })();
//   // }, []);

//   const getItems = async () => {
//     const items = await fetch('https://dummyjson.com/users').then(res =>
//       res.json()
//     );
//     const users = items.users.map(v => {
//       v.label = v.firstName + ' ' + v.lastName;
//       return v;
//     });
//     users.map(v => (v.value = (v.firstName + ' ' + v.lastName).toLowerCase()));
//     //get random number bw 0 and 10
//     const n = Math.floor(Math.random() * 100);
//     return items.users.slice(n, n + 10);
//   };

//   const handleCreateItem = async item => {
//     console.log(item);
//     const items = await getItems();
//     setPickerItems(items);
//     // setPickerItems(curr => (curr.length ? [...curr, item] : [item]));
//     // setSelectedItem(curr => [...curr, item]);
//     // return;
//   };

//   const handleselectedItemChange = () => {
//     if (selectedItem) {
//       setSelectedItem(selectedItem);
//     }
//   };

//   const customRender = selected => {
//     return (
//       <Flex flexDir="row" alignItems="center">
//         <Avatar mr={2} size="sm" name={selected.label} />
//         <Text>{selected.label}</Text>
//       </Flex>
//     );
//   };

//   const customCreateItemRender = value => {
//     return (
//       <Text>
//         Create
//         <Box as="span" bg="red.300" fontWeight="bold">
//           "{value}"
//         </Box>
//       </Text>
//     );
//   };

//   // const customCreateItemRender = () => {
//   //   return <></>;
//   // };

//   return (
//     <CUIAutoComplete
//       tagStyleProps={{
//         rounded: 'full',
//       }}
//       label="Address"
//       placeholder="Start typing an address"
//       onCreateItem={handleCreateItem}
//       items={pickerItems}
//       itemRenderer={customRender}
//       createItemRenderer={customCreateItemRender}
//       selectedItem={selectedItem}
//       onselectedItemChange={changes =>
//         handleselectedItemChange(changes.selectedItem)
//       }
//       hideToggleButton={true}
//       disableCreateItem={false}
//     />
//   );
// };

const items = [
  { author: 'Harper Lee', title: 'To Kill a Mockingbird' },
  { author: 'Lev Tolstoy', title: 'War and Peace' },
  { author: 'Fyodor Dostoyevsy', title: 'The Idiot' },
  { author: 'Oscar Wilde', title: 'A Picture of Dorian Gray' },
  { author: 'George Orwell', title: '1984' },
  { author: 'Jane Austen', title: 'Pride and Prejudice' },
  { author: 'Marcus Aurelius', title: 'Meditations' },
  { author: 'Fyodor Dostoevsky', title: 'The Brothers Karamazov' },
  { author: 'Lev Tolstoy', title: 'Anna Karenina' },
  { author: 'Fyodor Dostoevsky', title: 'Crime and Punishment' },
];

const menuStyles = {
  maxHeight: 150,
  maxWidth: 300,
  overflowY: 'scroll',
  backgroundColor: '#eee',
  padding: 0,
  listStyle: 'none',
  position: 'relative',
};

const toggleElementStyles = {
  backgroundColor: 'buttonface',
  padding: '0px 4px',
  display: 'inline',
  borderWidth: '1px',
  borderStyle: 'outset',
  borderColor: 'buttonborder',
  verticalAlign: 'middle',
  cursor: 'pointer',
};

export const DownshiftExample = () => {
  return (
    <Downshift
      onChange={selection =>
        alert(
          selection
            ? `You selected "${selection.title}" by ${selection.author}. Great Choice!`
            : 'Selection Cleared'
        )
      }
      itemToString={item => (item ? item.title : '')}
    >
      {({
        getInputProps,
        getItemProps,
        getLabelProps,
        getMenuProps,
        getToggleButtonProps,
        isOpen,
        inputValue,
        highlightedIndex,
        selectedItem,
        getRootProps,
      }) => (
        <div>
          <div className="w-72 flex flex-col gap-1">
            <label {...getLabelProps()}>Favorite Book:</label>
            <div
              className="flex shadow-sm bg-white gap-0.5"
              {...getRootProps({}, { suppressRefError: true })}
            >
              <input
                placeholder="Best book ever"
                className="w-full p-1.5"
                {...getInputProps()}
              />
              <button
                aria-label={'toggle menu'}
                className="px-2"
                type="button"
                {...getToggleButtonProps()}
              >
                {isOpen ? <>&#8593;</> : <>&#8595;</>}
              </button>
            </div>
          </div>
          <ul
            className="absolute w-72 bg-white mt-1 shadow-md max-h-80 overflow-scroll p-0"
            {...getMenuProps()}
          >
            {isOpen
              ? items
                  .filter(
                    item =>
                      !inputValue ||
                      item.title.toLowerCase().includes(inputValue) ||
                      item.author.toLowerCase().includes(inputValue)
                  )
                  .map((item, index) => (
                    <li
                      // className={cx(
                      //   highlightedIndex === index && 'bg-blue-300',
                      //   selectedItem === item && 'font-bold',
                      //   'py-2 px-3 shadow-sm flex flex-col'
                      // )}
                      {...getItemProps({
                        key: item.title,
                        index,
                        item,
                      })}
                    >
                      <span>{item.title}</span>
                      <span className="text-sm text-gray-700">
                        {item.author}
                      </span>
                    </li>
                  ))
              : null}
          </ul>
        </div>
      )}
    </Downshift>
  );
};

export const DropdownSelect = () => {
  const {
    isOpen,
    selectedItem,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    highlightedIndex,
    getItemProps,
  } = useSelect({ items });
  return (
    <div>
      <label {...getLabelProps()}>Choose an element:</label>
      <div style={toggleElementStyles} {...getToggleButtonProps()}>
        {selectedItem ?? 'Elements'}
      </div>
      <ul {...getMenuProps()} style={menuStyles}>
        {isOpen &&
          items.map((item, index) => (
            <li
              style={
                highlightedIndex === index ? { backgroundColor: '#bde4ff' } : {}
              }
              key={`${item}${index}`}
              {...getItemProps({ item, index })}
            >
              {item}
            </li>
          ))}
      </ul>
      {/* if you Tab from menu, focus goes on button, and it shouldn't. only happens here. */}
      <div tabIndex="0" />
    </div>
  );
};
