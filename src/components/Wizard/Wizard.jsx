import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  IconButton,
  Image,
  Input,
  Spacer,
  Stack,
  Text,
  VisuallyHiddenInput,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';

import AddressSearchForm from '../AddressSearchForm';
import ServiceAnimalToggle from '../Settings/Accessibility/ServiceAnimalToggle';
import { VerifyPin } from '../Shared/VerifyPin';
import WheelchairToggle from '../Settings/Accessibility/WheelchairToggle';
import { WizardStepThroughForm } from './WizardStepThroughForm';
import formatters from '../../utils/formatters';
import geocoder from '../../services/transport/geocoder';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../context/RootStore';
import useTranslation from '../../models/useTranslation';
import { toJS } from 'mobx';

export const Wizard = observer(({ hideModal }) => {
  const { loggedIn, reset } = useStore().authentication;
  const { t } = useTranslation();
  useEffect(() => {
    if (loggedIn) hideModal();
  }, [loggedIn, hideModal]);

  // FORMS STATE
  return (
    <Flex
      id="login-card"
      justifyContent={'center'}
      alignItems="center"
      flex={1}
      flexDirection="column"
    >
      <Stack
        spacing={8}
        w="100%"
        id="stack"
        bg={useColorModeValue('white', 'gray.700')}
      // boxShadow={'lg'}
      >
        <Center bg={useColorModeValue('white', 'white')} p={8}>
          <Image
            id="wizard-logo"
            src={'/buffalo_logo_full.png'}
            h={'200px'}
            alt={t('global.site')}
          />
        </Center>
        <Stack spacing={4} p={8}>
          <WizardStepThrough hideModal={hideModal}></WizardStepThrough>
        </Stack>
      </Stack>
      <Button variant={'outline'} colorScheme="red" onClick={() => reset()}>
        {t('global.cancel')}
      </Button>
    </Flex>
  );
});

const WizardStepThrough = observer(() => {
  const { user, updateUserProfile, updateUserPhone, verifyUser } =
    useStore().authentication;
  const { addLocation } = useStore().favorites;
  const { setStagedCaregiver, stagedCaregiver, invite: inviteCaregiver } = useStore().caregivers;
  const { t } = useTranslation();
  return (
    <WizardStepThroughForm
      content={[
        {
          title: 'contact',
          content: index => <ContactInfo index={index}></ContactInfo>,
          action: async e => {
            //add logic if the form has not been changed - add a hidden attribute to the form for changed/true/false
            const data = new FormData(e.target);
            // if (data.get('changed') === 'false') return true;
            const phone = '+1' + data.get('phone').replace(/-/g, '');
            // console.log('phone', phone);
            const updated = await updateUserPhone(phone);
            //NOTE step through form will not advance if action returns an error
            if (!updated || updated.error) {
              return false;
            }
            return updated;
          },
          buttonText: t('global.next'),
          skip: true,
        },
        {
          title: 'address',
          content: index => <HomeAddress index={index}></HomeAddress>,
          action: async e => {
            const data = new FormData(e.target);
            // if (data.get('changed') === 'false') return true;
            const address = {
              description: data.get('description'),
              distance: null,
              point: {
                lng: +data.get('lng'),
                lat: +data.get('lat'),
              },
              title: data.get('title'),
              text: data.get('address'),
            };
            const profile = Object.assign({}, user?.profile, { address });

            const updated = await updateUserProfile(profile);
            if (!updated || updated.error) {
              return false;
            }
            const favorited = await addLocation({ alias: 'HOME', ...address });
            if (!favorited || favorited.error) {
              return false;
            }
            return updated;
          },
          buttonText: t('global.next'),
          skip: true,
        },
        {
          title: 'caregiver',
          content: () => <Caregiver></Caregiver>,
          action: e => {
            const data = new FormData(e.target);
            const caregiver = {
              firstName: data.get('caregiverFirstName'),
              lastName: data.get('caregiverLastName'),
              email: data.get('caregiverEmail'),
            };
            setStagedCaregiver(caregiver);
            return true;
          },
          buttonText: t('global.next'),
          skip: true,
        },
        // {
        //   title: 'mobility',
        //   content: () => <MobilityOptions></MobilityOptions>,
        //   skip: true,
        //   buttonText: 'Check Email Address',
        // },
        {
          title: 'mobility',
          content: () => (
            <>
              <Heading as="h2" size="lg" fontWeight={400} color="brandDark">
                {t('loginWizard.accessibilityOptions')}
              </Heading>
              <Stack spacing={4}>
                <WheelchairToggle />
                <ServiceAnimalToggle />
              </Stack>
              <Spacer my={10} />
            </>
          ),
          buttonText: t('global.next'),
          skip: true,
        },
        {
          title: 'verify',
          content: () => <Complete></Complete>,
          skip: false,
          buttonText: (user?.phone && user?.phone === '+15555555555') ? t('global.save') : t('loginWizard.verifyPhone'),
          action: async () => {
            if (user?.phone && user?.phone !== '+15555555555') {
              const verified = verifyUser('sms', user?.phone);
              if (!verified || verified.error) {
                return false;
              }
              return true;
            }
            else {
              const profile = Object.assign({}, toJS(user?.profile), {
                onboarded: true,
              });
              try {
                const updated = await updateUserProfile(profile);
                if (!updated || updated.error) {
                  return false;
                }
                if (
                  Object.values(stagedCaregiver).filter(v => !!v).length ===
                  3
                ) {
                  await inviteCaregiver(
                    stagedCaregiver?.email,
                    stagedCaregiver?.firstName,
                    stagedCaregiver?.lastName
                  );
                }

                return updated;
              } catch (error) {
                console.log(error);
                return false;
              }
            }
          },
        },
        ...((user?.phone && user?.phone !== '+15555555555') ? [{
          title: 'finalize',
          content: () => <VerifyPin channel="sms"></VerifyPin>,
          hideButton: true,
          action: async () => {
            return;
          },
        }] : []
        ),
        // {
        //   title: 'sms',
        //   content: <Notifications stagedUser={stagedUser}></Notifications>,
        //   action: e => {
        //     const data = new FormData(e.target);
        //     // console.log(...data);
        //     const notifications = [];
        //     if (data.get('smsAlerts')) notifications.push('sms');
        //     if (data.get('emailAlerts')) notifications.push('email');
        //     setStagedUser({
        //       notifications: notifications,
        //     });
        //   },
        // },
      ]}
    ></WizardStepThroughForm>
  );
});

const ContactInfo = observer(() => {
  const { colorMode } = useColorMode();
  const { user } = useStore().authentication;
  console.log(user.phone);
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(
    user?.phone && user.phone === '+15555555555'
      ? ''
      : user?.phone
        ? formatters.phone.asDomestic(user?.phone.slice(2))
        : ''
  );
  const { t } = useTranslation();
  return (
    <Stack spacing={4}>
      <Heading
        as="h2"
        size="lg"
        fontWeight="400"
        color={colorMode === 'light' ? 'brandDark' : 'brand'}
      >
        {t('loginWizard.addContactInfo')}
      </Heading>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.300'}>
        {t('loginWizard.addContactInfoDescription')}
      </Text>
      <FormControl isReadOnly>
        <FormLabel>{t('loginWizard.email')}</FormLabel>
        <Input
          type="email"
          name="email"
          onChange={e => setEmail(e.target.value)}
          value={email || ''}
        />
      </FormControl>
      <FormControl>
        <FormLabel>{t('global.phone')}</FormLabel>
        <Input
          type="tel"
          name="phone"
          pattern="^\d{3}-\d{3}-\d{4}$"
          placeholder="555-555-5555"
          value={phone || ''}
          onChange={e => setPhone(formatters.phone.asDomestic(e.target.value))}
        />
      </FormControl>
    </Stack>
  );
});

//TODO push point to staged user from address
const HomeAddress = observer(({ index }) => {
  const { user } = useStore().authentication;
  const [_address, setAddress] = useState(user?.profile?.address?.text || '');
  const [geocoderResult, setGeocoderResult] = useState({});
  const [center, setCenter] = useState({
    lat: 0,
    lng: 0,
  });
  const [defaultAddress, setDefaultAddress] = useState(
    user?.profile?.address?.text || ''
  );
  const { colorMode } = useColorMode();
  const { t } = useTranslation();
  const getUserLocation = forced => {
    if (user?.profile?.address?.point?.lng && !forced) {
      setCenter({
        lat: +user?.profile?.address?.point?.lat,
        lng: +user?.profile?.address?.point?.lng,
      });
      return;
    }
    const success = async position => {
      console.log(position);
      const _center = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setCenter(_center);
      setGeocoderResult({});

      if (!forced) {
        const location = await geocoder.reverse(_center);
        console.log(location);
        if (location.length) {
          setDefaultAddress(location[0].title);
          setGeocoderResult(location[0]);
        }
      }
    };

    const error = error => {
      console.log(error);
    };

    navigator.geolocation.getCurrentPosition(success, error, {
      enableHighAccuracy: true,
      timeout: 10000,
    });
  };

  useEffect(() => {
    if (index !== 1) return;
    console.log(
      '[home-address] current address missing, getting user gps location'
    );
    getUserLocation();
    //eslint-disable-next-line
  }, [index, user]);

  useEffect(() => {
    console.log({ _address });
    if (
      !geocoderResult.title ||
      !geocoderResult.title.includes(_address.split(',')[0].trim())
    ) {
      //get the user's location is there is not geocoder result - this is the case when the user has not selected an address from the dropdown
      return getUserLocation(1);
    }
    //eslint-disable-next-line
  }, [_address]);

  useEffect(() => {
    console.log({ geocoderResult });
    if (!geocoderResult?.point?.lat || !geocoderResult?.point?.lng) return;
    setCenter({
      lat: geocoderResult?.point?.lat,
      lng: geocoderResult?.point?.lng,
    });
  }, [geocoderResult]);

  return (
    <Stack spacing={4}>
      <Heading
        as="h2"
        size="lg"
        fontWeight="400"
        color={colorMode === 'light' ? 'brandDark' : 'brand'}
        tabIndex={0}
      >
        {t('loginWizard.addHomeAddress')}
      </Heading>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        {t('loginWizard.addHomeDescription')}
      </Text>
      <FormControl isRequired>
        <AddressSearchForm
          saveAddress={setAddress}
          center={center}
          defaultAddress={defaultAddress}
          setGeocoderResult={setGeocoderResult}
          label={t('settingsProfile.homeAddress')}
        ></AddressSearchForm>
      </FormControl>
      <VisuallyHiddenInput
        type="text"
        name="description"
        value={geocoderResult?.description ? geocoderResult?.description : ''}
        onChange={event => {
          console.log(event.target.value);
        }}
      ></VisuallyHiddenInput>
      <VisuallyHiddenInput
        type="text"
        name="title"
        value={geocoderResult?.title ? geocoderResult?.title : _address || ''}
        onChange={event => {
          console.log(event.target.value);
        }}
      ></VisuallyHiddenInput>
      <FormControl>
        <HStack spacing={2}>
          <VisuallyHiddenInput
            type="number"
            name="lng"
            value={+center.lng || ''}
            readOnly
          ></VisuallyHiddenInput>
          <VisuallyHiddenInput
            type="number"
            name="lat"
            value={+center.lat || ''}
            readOnly
          ></VisuallyHiddenInput>
        </HStack>
      </FormControl>
      {/* <Checkbox onChange={e => getUserLocation(e.target.checked)}>
        Allow us to know your location information to provide accurate route
        estimates, pricing, and tracking. (Required)
      </Checkbox> */}
    </Stack>
  );
});

const Caregiver = observer(() => {
  const { colorMode } = useColorMode();
  const { stagedCaregiver } = useStore().caregivers;
  const { t } = useTranslation();
  // const [caregiverFirstName, setCaregiverFirstName] = useState(
  //   user?.profile?.caretakers && user.profile.caretakers.length
  //     ? user.profile.caretakers[0]?.firstName
  //     : ''
  // );
  // const [caretakerLastName, setCaregiverLastName] = useState(
  //   user?.profile?.caretakers && user.profile.caretakers.length
  //     ? user.profile.caretakers[0]?.lastName
  //     : ''
  // );
  // const [caretakerEmail, setCaregiverEmail] = useState(
  //   (user?.profile?.caretakers && user?.profile?.caretakers[0]?.email) || ''
  // );
  //TODO change from setting the caregiver each time to just set them at the on submit
  return (
    <Stack spacing={4}>
      <Heading
        as="h2"
        size="lg"
        fontWeight="400"
        color={colorMode === 'light' ? 'brandDark' : 'brand'}
      >
        {t('loginWizard.addPrimaryCaregiver')}
      </Heading>
      <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
        {t('loginWizard.addPrimaryCaregiverDescription')}
      </Text>
      <HStack>
        <FormControl isRequired>
          <FormLabel>{t('global.firstName')}</FormLabel>
          <Input
            type="text"
            name="caregiverFirstName"
            // onChange={e => setStagedCaregiver('firstName', e.target.value)}
            defaultValue={stagedCaregiver?.firstName || ''}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>{t('global.lastName')}</FormLabel>
          <Input
            type="text"
            name="caregiverLastName"
            // onChange={e => setStagedCaregiver('lastName', e.target.value)}
            defaultValue={stagedCaregiver?.lastName || ''}
          />
        </FormControl>
      </HStack>
      <FormControl isRequired>
        <FormLabel>{t('global.email')}</FormLabel>
        <Input
          type="email"
          name="caregiverEmail"
          // onChange={e => setStagedCaregiver('email', e.target.value)}
          defaultValue={stagedCaregiver?.email || ''}
        />
      </FormControl>
    </Stack>
  );
});

// const MobilityOptions = observer(() => {
//   const { colorMode } = useColorMode();
//   // const { user } = useStore().authentication;
//   const [email, setEmail] = useState();
//   const [email2, setEmail2] = useState();
//   const [email3, setEmail3] = useState();
//   const [hasEmail2, setHasEmail2] = useState(false);
//   const [hasEmail3, setHasEmail3] = useState(false);
//   const { t } = useTranslation();
//   return (
//     <Stack spacing={4}>
//       <Heading
//         as="h2"
//         size="lg"
//         fontWeight="400"
//         color={colorMode === 'light' ? 'brandDark' : 'brand'}
//       >
//         {t('loginWizard.addMobilityOptions')}
//       </Heading>
//       <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
//         {t('loginWizard.addMobilityOptionsDescription')}
//       </Text>
//       <FormControl>
//         <FormLabel>{t('global.emailAddress')}</FormLabel>
//         <Input
//           type="email"
//           name="email"
//           onChange={e => setEmail(e.target.value)}
//           value={email || ''}
//         />
//       </FormControl>
//       {hasEmail2 ? (
//         <FormControl>
//           <HStack justifyContent={'space-between'}>
//             <FormLabel>
//               {t('global.second')} {t('global.emailAddress')}
//             </FormLabel>
//             <IconButton
//               aria-label="Remove Email"
//               icon={<DeleteIcon />}
//               onClick={() => setHasEmail2(false)}
//               variant="ghost"
//             />
//           </HStack>
//           <Input
//             type="email"
//             name="email2"
//             onChange={e => setEmail2(e.target.value)}
//             value={email2 || ''}
//           />
//         </FormControl>
//       ) : null}
//       {hasEmail3 ? (
//         <FormControl>
//           <HStack justifyContent={'space-between'}>
//             <FormLabel>
//               {hasEmail2 ? t('global.third') : t('global.second')}{' '}
//               {t('global.emailAddress')}
//             </FormLabel>
//             <IconButton
//               aria-label="Remove Email"
//               icon={<DeleteIcon />}
//               onClick={() => setHasEmail3(false)}
//             />
//           </HStack>

//           <Input
//             type="email"
//             name="email3"
//             onChange={e => setEmail3(e.target.value)}
//             value={email3 || ''}
//           />
//         </FormControl>
//       ) : null}
//       {!hasEmail3 || !hasEmail2 ? (
//         <Button
//           color={colorMode === 'light' ? 'brandDark' : 'gray.400'}
//           _hover={{
//             opacity: 0.9,
//           }}
//           w="100%"
//           type="button"
//           variant={'link'}
//           leftIcon={<AddIcon />}
//           justifyContent="start"
//           onClick={() => {
//             if (!hasEmail2) {
//               setHasEmail2(true);
//             } else if (!hasEmail3) {
//               setHasEmail3(true);
//             } else return;
//           }}
//           isDisabled
//         >
//           {t('loginWizard.addAnotherEmail')}
//         </Button>
//       ) : (
//         ''
//       )}
//     </Stack>
//   );
// });

// const Notifications = observer(() => {
//   const { colorMode } = useColorMode();
//   const { user, updateUserProfile } = useStore().authentication;
//   const [changed, setChanged] = useState(false);
//   //NOTE using state here allows for the UI to change first, then the DB is updated
//   const [notifications, setNotifications] = useState(
//     user?.profile?.preferences?.notifications || []
//   );

//   useEffect(() => {
//     if (!changed) return;
//     const preferences = Object.assign({}, user?.profile?.preferences);
//     preferences['notifications'] = [...notifications];
//     (async () => {
//       const update = await updateUserProfile(
//         Object.assign({}, user?.profile, { preferences: preferences })
//       );
//       if (update.error) {
//         setNotifications(user?.profile?.preferences?.notifications || []);
//       }
//     })();
//     // eslint-disable-next-line
//   }, [notifications]);

//   const handleAlertChange = e => {
//     if (e.target.checked) {
//       console.log(e.target.value, true);
//       setNotifications([...notifications, e.target.value]);
//     } else {
//       console.log(e.target.value, false);
//       setNotifications(current => current.filter(n => n !== e.target.value));
//     }
//   };

//   return (
//     <Stack spacing={4}>
//       <Heading
//         as="h2"
//         size="lg"
//         fontWeight="400"
//         color={colorMode === 'light' ? 'brandDark' : 'brand'}
//       >
//         Get Notifications
//       </Heading>
//       <Text color={colorMode === 'light' ? 'gray.900' : 'gray.400'}>
//         The app uses notifications to alert you when active navigation is
//         happening so you won’t miss a step. To use this application, you must
//         have at least one activated.
//       </Text>
//       {/* {error ? <Box color="red.500">{error}</Box> : ''} */}
//       <Box as="form" onChange={() => setChanged(true)}>
//         <FormControl display="flex" alignItems="center" pl={10} mb={2}>
//           <FormLabel htmlFor="smsAlerts" mb="0" minW={'12'}>
//             SMS
//           </FormLabel>
//           <Switch
//             onChange={handleAlertChange}
//             value={'sms'}
//             isChecked={notifications.includes('sms') ? true : false}
//             isRequired={notifications.length === 0}
//           />
//         </FormControl>
//         <FormControl display="flex" alignItems="center" pl={10}>
//           <FormLabel htmlFor="emailAlerts" mb="0" minW={12}>
//             Email
//           </FormLabel>
//           <Switch
//             onChange={handleAlertChange}
//             value={'email'}
//             isChecked={notifications.includes('email')}
//             isRequired={notifications.length === 0}
//           />
//         </FormControl>
//       </Box>
//     </Stack>
//   );
// });

const Complete = observer(() => {
  const { user } = useStore().authentication;
  const { stagedCaregiver } = useStore().caregivers;
  const { t } = useTranslation();
  return (
    <Box m={4}>
      <Box my={4}>
        <Heading as="h3" size="md">
          {user?.profile?.firstName} {user?.profile?.lastName}
        </Heading>
        <Text>{user?.email}</Text>
        <Text>
          {(user?.phone && user?.phone !== '+15555555555')
            ? formatters.phone.asDomestic(user?.phone?.slice(2))
            : ''}
        </Text>
        <Text mt={2}>
          {user?.profile?.address?.title}{' '}
          {user?.profile?.address?.description ? ',' : ''}{' '}
          {user?.profile?.address?.description}
        </Text>
      </Box>

      <Heading as="h3" size="md">
        {t('global.caregiver')}
      </Heading>
      <Text>
        {stagedCaregiver?.firstName || ''} {stagedCaregiver?.lastName || ''}
      </Text>
      <Text>{stagedCaregiver?.email || ''}</Text>
    </Box>
  );
});
