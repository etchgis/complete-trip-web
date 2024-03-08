# comeplete-trip-web

![blitzwing](blitzwing.jpg)

## Kiosk & Keyboard

- A close button is added to the search inputs on the map screen and trip wizard screen
- This close button does not appear in the `webapp`/non-kiosk mode
- The close button _should_ clear the input, results, and stored keyboard state for that input
- The search results are usually shown when the input is focused, which does not work with the keyboard as the input loses focus once you click the keyboard. To get around this we use a `showResults` state inside the `AddressSearchForm` component, passed down to `Autocomplete`, that then programatically opens the `useComboBox` state via `useEffect`.
- The map page and trip wizard modal are given a padding/margin on the bottom to account for the keyboard
- The keyboard is positioned `absolute` so it can show up over the trip wizard modal
- On the initial screen the visible search input is set as the target input for the keyboard.
- Each input when focused becomes the target.
- When the modal is opened the start address search is the default target.
- The keyboard has three states where the input values are stored:
  - the state of the keyboard itself - managed via the `inputName` key prop
  - the state stored in the uiStore `onScreenKeyboardInput` object in redux - managed with the same keys
  - the local `address` state inside the search component

## Gleap

## Questions?

> Sidebar, Modals, or Dashboard to handle user accounts & preferences (prefer sidebar or modals)

## Task List

- [x] Add Leave By to Trip Wizard
- [x] Add transport to trip wizard
- [x] Add map to final result trip wizard
- [x] add formatted result to trip wizard

### User Functions

#### Registration

- [x] Create Account with email and password
- [x] Terms and Conditions (move to front)
- [x] Password Checker & Icons
- [x] Email Verify (fake)

#### Wizard

- [x] Add Phone Number
- [x] Add Address
- [x] Add 1 Caretaker
- [x] Add email to Enhanced Mobility

#### Update Settings

- [x] Profile

  - [x] Update Profile Name Address

- [x] Caretakers

  - [x] Update Caretaker
  - [x] Add Caretaker
  - [x] Delete Caretaker

- [x] Trip Preferences

  - [x] Walking
  - [x] Cost
  - [x] Transfers
  - [x] Wheelchair
  - [x] Modes

- [x] Language
- [x] SMS/Email

## Logins

malcolm@getbounds.com
malcolmtmeyer+81@gmail.com
pass: Test etc.

## Test Idea

[https://github.com/alex3165/react-mapbox-gl/blob/master/src/**tests**/map.test.tsx](https://github.com/alex3165/react-mapbox-gl/blob/master/src/__tests__/map.test.tsx)

## Notes

- `git commit -m "feat: description"`
- `git commit -m "patch: description"`
