import {
  Avatar,
  Box,
  Button,
  Divider,
  Heading,
  IconButton,
  Stack,
  Text,
  useColorMode,
} from '@chakra-ui/react';

import ConfirmDialog from '../ConfirmDialog';
import { DeleteIcon } from '@chakra-ui/icons';
import formatters from '../../utils/formatters';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/RootStore';
import useTranslation from '../../models/useTranslation';

export const ProfileInformation = observer(({ action }) => {
  const { user, removeUser } = useStore().authentication;
  const { setInTransaction } = useStore().authentication;
  const { t } = useTranslation();

  const navigate = useNavigate();
  /**
   *
   * @returns {Promise<boolean>}
   */
  async function deleteFn() {
    setInTransaction(true);
    const deleted = await removeUser();
    if (deleted) {
      setInTransaction(false);
      navigate('/');
      return true;
    } else {
      setInTransaction(false);
      return false;
    }
  }
  return (
    <Stack p={4} tabIndex={0}>
      <Avatar size="xl" mb={4}></Avatar>
      <Box fontWeight="bold" fontSize="sm" as="p">
        {t('global.name').toUpperCase()}
      </Box>
      <Text>
        {user?.profile?.firstName} {user?.profile?.lastName}
      </Text>
      <Text>{user?.email}</Text>
      <Text> {formatters.phone.asDomestic(user?.phone.slice(2)) || ''}</Text>
      <Box p={4}></Box>

      <Text pb={4}>{user?.profile?.address?.text}</Text>
      {/* <Box pb={4}>Columbus OH, 00000</Box> */}

      <Stack spacing={4} direction={{ base: 'column', md: 'row' }}>
        <Button variant={'brand'} onClick={action} maxWidth={'200px'}>
          {t('settingsProfile.editProfile')}
        </Button>

        <ConfirmDialog
          maxWidth={'200px'}
          confirmFn={deleteFn}
          buttonText={t('settingsProfile.deleteAccount')}
          verifyText="DELETE MY ACCOUNT"
          verifyMessage={"Type 'DELETE MY ACCOUNT'"}
          message={t('settingsProfile.confirmDeleteMessage')}
        />
      </Stack>
      {/* <FavoritesList /> */}
    </Stack>
  );
});

export const FavoritesList = observer(() => {
  // const { user } = useStore().authentication;
  // console.log(user?.profile?.favorites);
  const { trips: favoriteTrips, locations: favoriteLocations } =
    useStore().favorites;
  // console.log(favoriteTrips);
  // console.log(favoriteLocations);
  const { t } = useTranslation();
  return (
    <Box maxW={{ base: '100%', md: 'md' }}>
      <Box py={6}>
        <Divider />
      </Box>
      <Stack spacing={4}>
        {favoriteTrips.length ? (
          <Heading as="h3" size="md">
            {t('settingsFavorites.favorites')}
          </Heading>
        ) : (
          <Text opacity={0.8}>{t('settingsFavorites.noFavorites')}</Text>
        )}
        {favoriteTrips.map((f, i) => {
          return (
            <FavoriteCard
              key={f.id.toString()}
              id={f.id}
              title={f.alias}
              description={f.origin.text + ' to ' + f.destination.text}
              type="trip"
            />
          );
        })}
      </Stack>
      <Box py={6}>
        <Divider />
      </Box>
      <Stack spacing={4}>
        {favoriteLocations.length ? (
          <Heading as="h3" size="md">
            {t('settingsFavorites.locations')}
          </Heading>
        ) : (
          <Text opacity={0.8}>No Saved Locations Found</Text>
        )}
        {favoriteLocations.map((f, i) => (
          <FavoriteCard
            key={f.id.toString()}
            id={f.id}
            title={f.alias}
            description={f.text}
            type="locations"
          />
        ))}
      </Stack>
    </Box>
  );
});

const FavoriteCard = ({ id, title, description, type }) => {
  const { colorMode } = useColorMode();
  const { removeTrip, removeLocation } = useStore().favorites;
  const { t } = useTranslation();
  return (
    <Stack
      data-id={id}
      background={colorMode === 'light' ? 'white' : 'gray.900'}
      p={4}
      borderRadius={'md'}
      border="1px"
      borderColor={colorMode === 'light' ? 'gray.300' : 'gray.700'}
      flexDir={{ base: 'column', sm: 'row' }}
      display={'flex'}
      justifyContent={'space-between'}
      width={'100%'}
    >
      <Box flex="1">
        <Text color={'brand'} fontWeight={'bold'}>
          {title}
        </Text>
        <Text fontSize={'md'} opacity={0.8}>
          {description}
        </Text>
      </Box>

      <IconButton
        variant={'ghost'}
        onClick={() => {
          if (type === 'trip') removeTrip(id);
          else removeLocation(id);
        }}
        icon={<DeleteIcon />}
        aria-label={t('settingsFavorites.delete')}
      />
    </Stack>
  );
};

// export const Accessibility = observer(({ action }) => {
//   const { user } = useStore().authentication;

//   return (
//     <Stack p={4} maxW={{ base: '100%', md: 'md' }}>
//       <Box fontWeight="bold" fontSize="sm">
//         Display Language
//       </Box>
//       <Box pb={4}>
//         {user?.profile?.preferences?.language === 'en' ||
//         !user?.profile?.preferences?.language
//           ? 'English'
//           : 'Spanish'}
//       </Box>
//       <Button
//         bg="brand"
//         _hover={{
//           opacity: '0.8',
//         }}
//         color="white"
//         onClick={action}
//       >
//         Edit
//       </Button>
//     </Stack>
//   );
// });

export const TermsOfUse = () => {
  const { t } = useTranslation();
  return (
    <Stack spacing={2} fontSize="16px" tabIndex={0}>
      <Heading as="h2" size="lg">
        {t('settingsTerms.title')}
      </Heading>
      <Text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed auctor,
        magna id congue commodo, ipsum velit sollicitudin velit, vel tincidunt
        velit augue id odio. Sed varius, nibh quis malesuada aliquet, turpis
        augue convallis odio, id malesuada quam magna sit amet massa. Nam
        bibendum justo eget ante luctus, in aliquet enim faucibus. Praesent id
        ligula eget erat auctor euismod. Praesent auctor, enim id faucibus
        aliquam, odio erat posuere ipsum, eu malesuada ipsum magna sit amet
        turpis. Sed ac semper magna. Sed malesuada, magna eget malesuada
        pellentesque, leo ligula ornare velit, id condimentum augue orci vitae
        elit. Donec quis elit velit.
      </Text>
      <Text>
        Duis vel mi id ipsum congue vestibulum. Sed aliquet, eros eget accumsan
        scelerisque, nibh nulla placerat velit, id dictum velit ipsum vel nibh.
        In euismod elit velit, vel pellentesque ipsum scelerisque vel. Nam augue
        nibh, aliquet ac facilisis a, placerat vitae ipsum. Sed malesuada,
        turpis id dictum bibendum, magna augue malesuada enim, ut viverra risus
        libero id ligula. Sed pellentesque, ipsum vel accumsan malesuada, magna
        risus interdum nulla, non congue urna nibh id magna. Nam eget dolor
        vestibulum, gravida magna ut, rhoncus libero.
      </Text>
    </Stack>
  );
};

export const PrivacyPolicy = () => {
  const { t } = useTranslation();
  return (
    <Box tabIndex={0}>
      <Heading as="h2" size="lg">
        {t('settingsPrivacy.title')}
      </Heading>
      <Text fontSize={'16px'}>
        Privacy Policy We respect your privacy and are committed to protecting
        it. This Privacy Policy explains what information we collect, how we use
        it, and how you can control it.
        <br></br>
        <br></br>
        Information Collection
        <br></br>
        <br></br>
        We collect information that you provide to us directly, such as when you
        create an account, place an order, or contact us with a question or
        concern. This information may include your name, email address, and
        other contact information.
        <br></br>
        <br></br>
        We may also automatically collect certain information about your use of
        our services, such as your browsing and search history, device
        information, and location data. This information is collected through
        the use of cookies and other technologies.
        <br></br>
        <br></br>
        Information Use
        <br></br>
        <br></br>
        We use the information we collect to provide and improve our services,
        and to communicate with you. For example, we may use your email address
        to send you updates on your order or to respond to your customer service
        inquiries.
        <br></br>
        <br></br>
        We may also use the information we collect to personalize your
        experience on our website and to send you targeted marketing
        communications.
        <br></br>
        <br></br>
        Information Control
        <br></br>
        <br></br>
        You have the right to access and control your personal information. You
        can request access to your information, update your information, or ask
        us to delete it by contacting us at privacy@example.com.
        <br></br>
        <br></br>
        You can also control the use of cookies and other technologies through
        your browser settings.
        <br></br>
        <br></br>
        Changes to this Privacy Policy
        <br></br>
        <br></br>
        We may update this Privacy Policy from time to time. If we make any
        changes, we will notify you by revising the date at the top of this
        policy and, in some cases, provide you with additional notice (such as
        adding a statement to our homepage or sending you an email
        notification).
        <br></br>
        <br></br>
        Contact Us
        <br></br>
        <br></br>
        If you have any questions or concerns about this Privacy Policy or our
        privacy practices, please contact us at privacy@example.com.
      </Text>
    </Box>
  );
};
