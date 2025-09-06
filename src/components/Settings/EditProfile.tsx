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
import { Address, Coordinates } from '../../types/UserProfile';

interface EditProfileProps {
  onClose: () => void;
}

export const EditProfile: React.FC<EditProfileProps> = ({ onClose }) => {
  const { user, updateUserProfile } = useStore().authentication;

  // Address
  const [_address, setAddress] = useState(user?.profile?.address?.text || '');
  const [geocoderResult, setGeocoderResult] = useState<any>({});
  console.log(_address);
  console.log({ geocoderResult });

  const [center, setCenter] = useState<Partial<Coordinates>>({ lat: undefined, lng: undefined });

  const firstName = useRef<HTMLInputElement>(null);
  const lastName = useRef<HTMLInputElement>(null);
  const email = useRef<HTMLInputElement>(null);

  const getUserLocation = () => {
    const success = (position: GeolocationPosition) => {
      // console.log(position);
      setCenter({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    };

    const error = (error: GeolocationPositionError) => {
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
        onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
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
          {user.phone !== '+15555555555' &&
            <FormControl>
              <FormLabel>{t('global.phone')}</FormLabel>
              <Input
                type="tel"
                name="phone"
                onChange={() => { }}
                disabled
                value={
                  user.phone
                    ? formatters.phone.asDomestic(user.phone.slice(2))
                    : ''
                }
              />
            </FormControl>
          }
          <FormControl isRequired>
            <AddressSearchForm
              saveAddress={setAddress}
              center={center}
              defaultAddress={user?.profile?.address?.text || ''}
              setGeocoderResult={setGeocoderResult}
              label={t('settingsProfile.homeAddress')}
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
