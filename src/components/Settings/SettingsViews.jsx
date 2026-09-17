import {
  Avatar,
  Box,
  Button,
  Divider,
  Heading,
  IconButton,
  List,
  ListItem,
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
    <Stack p={4}>
      <Avatar size="xl" mb={4}></Avatar>
      <Box fontWeight="bold" fontSize="sm" as="p" tabIndex={0}>
        {t('global.name').toUpperCase()}
      </Box>
      <Box tabIndex={0}>
        <Text>
          {user?.profile?.firstName} {user?.profile?.lastName}
        </Text>
        <Text>{user?.email}</Text>
        {user.phone && <Text> {user?.phone !== '+15555555555' ? formatters.phone.asDomestic(user?.phone.slice(2)) || '' : ''}</Text>}
        <Box p={4}></Box>

        <Text pb={4}>{user?.profile?.address?.text}</Text>
      </Box>
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
        <Divider aria-hidden={true} />
      </Box>
      <Stack spacing={4}>
        {favoriteTrips.length ? (
          <Heading as="h3" size="md" tabIndex={0}>
            {t('settingsFavorites.favorites')}
          </Heading>
        ) : null}
        {favoriteTrips.map((f, i) => {
          return (
            <FavoriteCard
              key={f.id.toString()}
              id={f.id}
              title={f.alias}
              description={`${f.origin.text} ${t('global.to').toLowerCase()} ${
                f.destination.text
              }`}
              type="trip"
            />
          );
        })}
      </Stack>
      <Box py={6}>
        <Divider aria-hidden={true} />
      </Box>
      <Stack spacing={4}>
        {favoriteLocations.length ? (
          <Heading as="h3" size="md">
            {t('settingsFavorites.locations')}
          </Heading>
        ) : null}
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
      data-testid={id}
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
      {t('settingsTerms.termsText')}
      </Text>
      <Text as={'b'}>
      {t('settingsTerms.availability')}
      </Text>
      <Text>
      {t('settingsTerms.availabilityText')}
      </Text>
      <Text as={'b'}>
      {t('settingsTerms.privacy')}
      </Text>
      <Text>
      {t('settingsTerms.privacyText')}
      </Text>
      <Text as={'b'}>
      {t('settingsTerms.changesToApp')}
      </Text>
      <Text>
      {t('settingsTerms.changesToAppText')}
      </Text>
      <Text as={'b'}>
      {t('settingsTerms.changesToTerms')}
      </Text>
      <Text>
      {t('settingsTerms.changesToTermsText')}
      </Text>

      <Box mt={8} pt={6} borderTop="2px" borderColor="gray.300">
        <Heading as="h3" size="md" mb={4}>
          {t('shuttleTerms.allAccessLoop')}
        </Heading>

        <Box mb={4}>
          <Heading as="h4" size="sm" mb={2}>
            {t('shuttleTerms.generalConduct')}
          </Heading>
          <List as="ul" styleType="disc" spacing={3} pl={5}>
            {t('shuttleTerms.generalConductItems').map((item, index) => (
              <ListItem key={index}>
                <Text fontWeight="bold">{item.title}</Text>
                <Text>{item.text}</Text>
              </ListItem>
            ))}
          </List>
        </Box>

        <Box mb={4}>
          <Heading as="h4" size="sm" mb={2}>
            {t('shuttleTerms.automatedDriveWarnings')}
          </Heading>
          <List as="ul" styleType="disc" spacing={3} pl={5}>
            {t('shuttleTerms.automatedDriveWarningsItems').map((item, index) => (
              <ListItem key={index}>
                <Text fontWeight="bold">{item.title}</Text>
                <Text>{item.text}</Text>
              </ListItem>
            ))}
          </List>
        </Box>

        <Box mb={4}>
          <Heading as="h4" size="sm" mb={2}>
            {t('shuttleTerms.mediaRelease')}
          </Heading>
          <Text>
            {t('shuttleTerms.mediaReleaseText')}
          </Text>
        </Box>

        <Box mb={4}>
          <Heading as="h4" size="sm" mb={2}>
            {t('shuttleTerms.serviceAnimals')}
          </Heading>
          <Text whiteSpace="pre-line">
            {t('shuttleTerms.serviceAnimalsText')}
          </Text>
        </Box>

        <Box mb={4}>
          <Heading as="h4" size="sm" mb={2}>
            {t('shuttleTerms.noFirearmsWeapons')}
          </Heading>
          <Text>
            {t('shuttleTerms.noFirearmsWeaponsText')}
          </Text>
        </Box>
      </Box>
    </Stack>
  );
};

export const PrivacyPolicy = () => {
  const { t } = useTranslation();
  return (
    <Stack spacing={4} fontSize="16px" tabIndex={0}>
      <Heading as="h2" size="lg">
        {t('settingsPrivacy.title')}
      </Heading>
      
      <Text>
        We respect your privacy and are committed to protecting it. This Privacy Policy 
        explains what information we collect, how we use it, and how you can control it.
      </Text>

      <Box>
        <Heading as="h3" size="md" mb={2}>
          Information Collection
        </Heading>
        <Stack spacing={3}>
          <Text>
            We collect information that you provide to us directly, such as when you
            create an account, place an order, or contact us with a question or
            concern. This information may include your name, email address, and
            other contact information.
          </Text>
          <Text>
            We may also automatically collect certain information about your use of
            our services, such as your browsing and search history, device
            information, and location data. This information is collected through
            the use of cookies and other technologies.
          </Text>
        </Stack>
      </Box>

      <Box>
        <Heading as="h3" size="md" mb={2}>
          Information Use
        </Heading>
        <Stack spacing={3}>
          <Text>
            We use the information we collect to provide and improve our services,
            and to communicate with you. For example, we may use your email address
            to send you updates on your order or to respond to your customer service
            inquiries.
          </Text>
          <Text>
            We may also use the information we collect to personalize your
            experience on our website and to send you targeted marketing
            communications.
          </Text>
        </Stack>
      </Box>

      <Box>
        <Heading as="h3" size="md" mb={2}>
          Information Control
        </Heading>
        <Stack spacing={3}>
          <Text>
            You have the right to access and control your personal information. You
            can request access to your information, update your information, or ask
            us to delete it by contacting us at privacy@example.com.
          </Text>
          <Text>
            You can also control the use of cookies and other technologies through
            your browser settings.
          </Text>
        </Stack>
      </Box>

      <Box>
        <Heading as="h3" size="md" mb={2}>
          Changes to this Privacy Policy
        </Heading>
        <Text>
          We may update this Privacy Policy from time to time. If we make any
          changes, we will notify you by revising the date at the top of this
          policy and, in some cases, provide you with additional notice (such as
          adding a statement to our homepage or sending you an email
          notification).
        </Text>
      </Box>

      <Box>
        <Heading as="h3" size="md" mb={2}>
          Contact Us
        </Heading>
        <Text>
          If you have any questions or concerns about this Privacy Policy or our
          privacy practices, please contact us at privacy@example.com.
        </Text>
      </Box>
    </Stack>
  );
};
