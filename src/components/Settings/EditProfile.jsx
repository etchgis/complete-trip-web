import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Stack,
} from '@chakra-ui/react';

import AddressSearchForm from '../AddressSearchForm';
import formatters from '../../utils/formatters';
import { useEffect } from 'react';
import { useRef } from 'react';
import { useState } from 'react';
import { useStore } from '../../context/RootStore';
import useTranslation from '../../models/useTranslation';

export const EditProfile = ({ onClose }) => {
  const { user, updateUserProfile } = useStore().authentication;

  // Address
  const [_address, setAddress] = useState(user?.profile?.address?.text || '');
  const [geocoderResult, setGeocoderResult] = useState({});
  console.log(_address);
  console.log({ geocoderResult });

  const [center, setCenter] = useState({ lat: null, lng: null });

  const firstName = useRef();
  const lastName = useRef();
  const email = useRef();

  const getUserLocation = () => {
    const success = position => {
      // console.log(position);
      setCenter({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
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
    console.log('[edit profile] getting user gps location');
    if (navigator && navigator.geolocation) getUserLocation();
  }, []);

  const { t } = useTranslation();

  return (
    <Box>
      <Box
        as="form"
        onSubmit={async e => {
          e.preventDefault();
          const data = new FormData(e.target);
          console.log(...data);
          if (!geocoderResult?.title) {
            //TODO create an error here and show some validation message
            console.log('[edit profile] no address selected');
          }
          await updateUserProfile(
            Object.assign({}, user?.profile, {
              firstName: data.get('firstName'),
              lastName: data.get('lastName'),
              address: {
                description: geocoderResult?.description || '',
                distance: geocoderResult?.distance || '',
                point: {
                  lat: geocoderResult?.point?.lat || center.lat,
                  lng: geocoderResult?.point?.lng || center.lng,
                },
                title: geocoderResult?.title || _address || '',
                text: geocoderResult?.name || _address || '',
              },
            })
          );
          onClose();
        }}
      >
        <Stack spacing={4}>
          <HStack>
            <FormControl>
              <FormLabel>{t('global.firstName')}</FormLabel>
              <Input
                ref={firstName}
                type="text"
                name="firstName"
                defaultValue={user?.profile?.firstName}
              />
            </FormControl>
            <FormControl>
              <FormLabel>{t('global.lastName')}</FormLabel>
              <Input
                ref={lastName}
                type="text"
                name="lastName"
                defaultValue={user?.profile?.lastName}
              />
            </FormControl>
          </HStack>

          <FormControl>
            <FormLabel>{t('global.email')}</FormLabel>
            <Input
              ref={email}
              type="email"
              name="email"
              defaultValue={user?.email || ''}
              disabled
            />
          </FormControl>
          <FormControl>
            <FormLabel>{t('global.phone')}</FormLabel>
            <Input
              type="tel"
              name="phone"
              onChange={() => {}}
              disabled
              value={
                user.phone
                  ? formatters.phone.asDomestic(user.phone.slice(2))
                  : ''
              }
            />
          </FormControl>
          <FormControl isRequired>
            <AddressSearchForm
              saveAddress={setAddress}
              center={center}
              defaultAddress={user?.profile?.address?.text || ''}
              setGeocoderResult={setGeocoderResult}
              label="Home Address"
            ></AddressSearchForm>
          </FormControl>
          <Button
            bg={'brand'}
            color={'white'}
            _hover={{
              bg: 'blue.500',
            }}
            type="submit"
            mt={6}
          >
            {t('global.save')}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};
