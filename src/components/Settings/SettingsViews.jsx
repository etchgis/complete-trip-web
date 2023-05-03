import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  Divider,
  Heading,
  IconButton,
  Stack,
  Text,
  useColorMode,
} from '@chakra-ui/react';

import ConfirmDialog from '../ConfirmDialog';
import formatters from '../../utils/formatters';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/RootStore';

export const ProfileInformation = observer(({ action }) => {
  const { user, removeUser } = useStore().authentication;
  const { setInTransaction } = useStore().authentication;
  
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
      navigate("/")
      return true;
    } else {
      setInTransaction(false);
      return false;
    }
  }

  return (
    <Stack p={4}>
      <Avatar size="xl" mb={4}></Avatar>
      <Box fontWeight="bold" fontSize="sm">
        NAME
      </Box>
      <Box>
        {user?.profile?.firstName} {user?.profile?.lastName}
      </Box>
      <Box>{user?.email}</Box>
      <Box> {formatters.phone.asDomestic(user?.phone.slice(2)) || ''}</Box>
      <Box p={4}></Box>
      <Box>
        <Box pb={4}>{user?.profile?.address?.text}</Box>
        {/* <Box pb={4}>Columbus OH, 00000</Box> */}
      </Box>

      <Stack spacing={4} direction={{ base: 'column', md: 'row' }}>
        <Button
          bg="brand"
          _hover={{
            opacity: '0.8',
          }}
          color="white"
          onClick={action}
          maxWidth={'200px'}
        >
          Edit Profile
        </Button>

        <ConfirmDialog
          maxWidth={'200px'}
          confirmFn={deleteFn}
          buttonText={'Delete Account'}
          verifyText={'Delete my account'}
          verifyMessage={"Type 'DELETE MY ACCOUNT'"}
          message={
            'Are you sure you would like to delete your account? If you do this, you will need create an new account again for access.'
          }
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
  return (
    <>
      <Box py={6}>
        <Divider />
      </Box>
      <Stack spacing={4}>
        {favoriteTrips.length ? (
          <Heading as="h3" size="md">
            Favorite Trips
          </Heading>
        ) : (
          <Text opacity={0.8}>No favorite Trips found.</Text>
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
            Favorite Locations
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
    </>
  );
});

const FavoriteCard = ({ id, title, description, type }) => {
  const { colorMode } = useColorMode();
  const { removeTrip, removeLocation } = useStore().favorites;
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
      />
    </Stack>
  );
};

export const Accessibility = observer(({ action }) => {
  const { user } = useStore().authentication;

  return (
    <Stack p={4}>
      <Box fontWeight="bold" fontSize="sm">
        Display Language
      </Box>
      <Box pb={4}>
        {user?.profile?.preferences?.language === 'en' ||
        !user?.profile?.preferences?.language
          ? 'English'
          : 'Spanish'}
      </Box>
      <Button
        bg="brand"
        _hover={{
          opacity: '0.8',
        }}
        color="white"
        onClick={action}
      >
        Edit
      </Button>
    </Stack>
  );
});

export const CaretakerCards = ({ action, caretakers }) => {
  return (
    <>
      <Stack spacing={6}>
        {caretakers.map((caretaker, i) => (
          <CaretakerCard
            key={i.toString()}
            caretaker={caretaker}
            action={() => {
              action(i);
            }}
          />
        ))}
      </Stack>

      <Button
        mt={6}
        variant={'outline'}
        color={'brand'}
        // bg={'brand'}
        // _hover={{
        //   opacity: '0.8',
        // }}
        leftIcon={<AddIcon />}
        onClick={() => action(null)}
      >
        Add Caretaker
      </Button>
    </>
  );
};

export const CaretakerCard = ({ action, caretaker }) => {
  return (
    <Card maxW="sm" variant={'outline'}>
      <CardBody>
        <Stack spacing="3">
          <Heading size="md">
            {caretaker?.firstName} {caretaker?.lastName}
          </Heading>
          <Text>{formatters.phone.asDomestic(caretaker?.phone.slice(2))}</Text>
          <Text>{caretaker?.email}</Text>
        </Stack>
      </CardBody>
      <Divider />
      <CardFooter p={2}>
        <Button
          bg="brand"
          _hover={{
            opacity: '0.8',
          }}
          color="white"
          onClick={action}
        >
          Edit
        </Button>
      </CardFooter>
    </Card>
  );
};

export const TermsOfUse = () => {
  return (
    <Stack spacing={2} fontSize="16px">
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
  return (
    <Text fontSize={'16px'}>
      Privacy Policy We respect your privacy and are committed to protecting it.
      This Privacy Policy explains what information we collect, how we use it,
      and how you can control it.
      <br></br>
      <br></br>
      Information Collection
      <br></br>
      <br></br>
      We collect information that you provide to us directly, such as when you
      create an account, place an order, or contact us with a question or
      concern. This information may include your name, email address, and other
      contact information.
      <br></br>
      <br></br>
      We may also automatically collect certain information about your use of
      our services, such as your browsing and search history, device
      information, and location data. This information is collected through the
      use of cookies and other technologies.
      <br></br>
      <br></br>
      Information Use
      <br></br>
      <br></br>
      We use the information we collect to provide and improve our services, and
      to communicate with you. For example, we may use your email address to
      send you updates on your order or to respond to your customer service
      inquiries.
      <br></br>
      <br></br>
      We may also use the information we collect to personalize your experience
      on our website and to send you targeted marketing communications.
      <br></br>
      <br></br>
      Information Control
      <br></br>
      <br></br>
      You have the right to access and control your personal information. You
      can request access to your information, update your information, or ask us
      to delete it by contacting us at privacy@example.com.
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
      changes, we will notify you by revising the date at the top of this policy
      and, in some cases, provide you with additional notice (such as adding a
      statement to our homepage or sending you an email notification).
      <br></br>
      <br></br>
      Contact Us
      <br></br>
      <br></br>
      If you have any questions or concerns about this Privacy Policy or our
      privacy practices, please contact us at privacy@example.com.
    </Text>
  );
};
