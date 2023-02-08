import { BiHomeAlt, BiMapAlt } from 'react-icons/bi';
import {
  Box,
  Button,
  CloseButton,
  Drawer,
  DrawerContent,
  Flex,
  Stack,
  useColorMode,
} from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';

import { BsPerson } from 'react-icons/bs';
import { CgCalendarToday } from 'react-icons/cg';
import { useAuthenticationStore } from '../../context/AuthenticationStoreZS';

export const ResponsiveSidebar = ({ isOpen, onClose, setView }) => {
  const { colorMode } = useColorMode();

  return (
    <>
      <Box
        borderRight="solid thin lightgray"
        borderColor={colorMode === 'light' ? 'gray.200' : 'gray.900'}
        display={{ base: 'none', md: 'block' }}
      >
        <SidebarContent data-testid="desktop-sidebar" />
      </Box>
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent
            onClose={onClose}
            setView={setView}
            data-testid="mobile-sidebar"
          />
        </DrawerContent>
      </Drawer>
    </>
  );
};

const SidebarContent = ({ onClose, rest }) => {
  const { loggedIn } = useAuthenticationStore();
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const { pathname: location } = useLocation();
  return (
    <Flex flexDir={'column'} {...rest}>
      <CloseButton
        display={{ base: 'flex', md: 'none' }}
        onClick={onClose}
        alignSelf="flex-end"
        size="lg"
      />
      <Stack spacing={2} p={6}>
        <Button
          leftIcon={<BiHomeAlt />}
          variant={'ghost'}
          justifyContent="flex-start"
          color={
            colorMode === 'dark'
              ? 'white'
              : location === '/'
              ? 'brandDark'
              : 'brand'
          }
          fontWeight={location === '/' ? '600' : 400}
          onClick={() => {
            if (onClose) onClose();
            return navigate('/');
          }}
        >
          Home
        </Button>
        <Button
          leftIcon={<CgCalendarToday />}
          variant={'ghost'}
          justifyContent="flex-start"
          color={
            colorMode === 'dark'
              ? 'white'
              : location === '/trips'
              ? 'brandDark'
              : 'brand'
          }
          fontWeight={location === '/trips' ? '600' : 400}
          onClick={() => {
            if (onClose) onClose();
            return navigate('/trips');
          }}
        >
          Trips
        </Button>

        <Button
          leftIcon={<BiMapAlt />}
          variant={'ghost'}
          justifyContent="flex-start"
          color={
            colorMode === 'dark'
              ? 'white'
              : location === '/map'
              ? 'brandDark'
              : 'brand'
          }
          fontWeight={location === '/map' ? '600' : 400}
          onClick={() => {
            if (onClose) onClose();
            return navigate('/map');
          }}
        >
          Map
        </Button>
        {loggedIn ? (
          <Button
            leftIcon={<BsPerson />}
            variant={'ghost'}
            justifyContent="flex-start"
            color={
              colorMode === 'dark'
                ? 'white'
                : location.includes('/settings')
                ? 'brandDark'
                : 'brand'
            }
            fontWeight={location.includes('/settings') ? '600' : 400}
            onClick={() => {
              if (onClose) onClose();
              return navigate('/settings/profile');
            }}
          >
            Profile and Settings
          </Button>
        ) : (
          ''
        )}
      </Stack>
    </Flex>
  );
};
