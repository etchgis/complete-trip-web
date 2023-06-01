import { BiHomeAlt, BiMapAlt } from 'react-icons/bi';
import {
  Box,
  Button,
  CloseButton,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Flex,
  IconButton,
  Stack,
  Tooltip,
  useColorMode,
} from '@chakra-ui/react';
import { useLocation, useNavigate } from 'react-router-dom';

import { BsPerson } from 'react-icons/bs';
import { CgCalendarToday } from 'react-icons/cg';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../context/RootStore';

export const ResponsiveSidebar = ({
  isOpen,
  onClose,
  setView,
  testContent,
  testUser,
}) => {
  const { colorMode } = useColorMode();

  return (
    <>
      <Box
        borderRight="solid thin lightgray"
        borderColor={colorMode === 'light' ? 'gray.200' : 'gray.900'}
        display={{ base: 'none', lg: 'block' }}
      >
        <SidebarContentIconsDesktop
          onClose={onClose}
          setView={setView}
          data-testid="mobile-sidebar"
          testUser={testUser}
        />
      </Box>
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size={{ base: 'full', sm: 'sm' }}
      >
        <DrawerOverlay />
        <DrawerContent>
          <SidebarContent
            display={{ base: 'block', lg: 'none' }}
            onClose={onClose}
            setView={setView}
            data-testid="mobile-sidebar"
            testUser={testUser}
          />
          {testContent ? testContent : null}
        </DrawerContent>
      </Drawer>
    </>
  );
};

const SidebarContentIconsDesktop = observer(({ onClose, rest, testUser }) => {
  const { loggedIn } = useStore().authentication;
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const { pathname: location } = useLocation();
  return (
    <Flex flexDir={'column'} {...rest}>
      <Stack spacing={2} p={2}>
        {loggedIn || testUser?.loggedIn ? (
          <>
            {' '}
            <Tooltip label="Home">
              <IconButton
                aria-label="Home"
                icon={<BiHomeAlt />}
                fontSize={'32px'}
                variant={'ghost'}
                color={
                  colorMode === 'dark'
                    ? 'white'
                    : location === '/home'
                    ? 'brandDark'
                    : 'brand'
                }
                bg={
                  location === '/home'
                    ? colorMode === 'light'
                      ? 'gray.100'
                      : 'gray.700'
                    : 'transparent'
                }
                fontWeight={location === '/home' ? '600' : 400}
                onClick={() => {
                  if (onClose) onClose();
                  return navigate('/home');
                }}
              />
            </Tooltip>
            <Tooltip label="Trips">
              <IconButton
                aria-label="Trips"
                icon={<CgCalendarToday />}
                fontSize={'32px'}
                variant={'ghost'}
                color={
                  colorMode === 'dark'
                    ? 'white'
                    : location === '/trips'
                    ? 'brandDark'
                    : 'brand'
                }
                bg={
                  location === '/trips'
                    ? colorMode === 'light'
                      ? 'gray.100'
                      : 'gray.700'
                    : 'transparent'
                }
                fontWeight={location === '/trips' ? '600' : 400}
                onClick={() => {
                  if (onClose) onClose();
                  return navigate('/trips');
                }}
              />
            </Tooltip>
          </>
        ) : (
          ''
        )}
        <Tooltip label="Map">
          <IconButton
            aria-label="Map"
            icon={<BiMapAlt />}
            variant={'ghost'}
            fontSize={'32px'}
            color={
              colorMode === 'dark'
                ? 'white'
                : location === '/map'
                ? 'brandDark'
                : 'brand'
            }
            bg={
              location === '/map'
                ? colorMode === 'light'
                  ? 'gray.100'
                  : 'gray.700'
                : 'transparent'
            }
            fontWeight={location === '/map' ? '600' : 400}
            onClick={() => {
              if (onClose) onClose();
              return navigate('/map');
            }}
          />
        </Tooltip>

        {loggedIn || testUser?.loggedIn ? (
          <Tooltip label="Profile and Settings">
            <IconButton
              aria-label="Profile and Settings"
              icon={<BsPerson />}
              variant={'ghost'}
              fontSize={'32px'}
              color={
                colorMode === 'dark'
                  ? 'white'
                  : location.includes('/settings')
                  ? 'brandDark'
                  : 'brand'
              }
              bg={
                location.includes('/settings')
                  ? colorMode === 'light'
                    ? 'gray.100'
                    : 'gray.700'
                  : 'transparent'
              }
              fontWeight={location.includes('/settings') ? '600' : 400}
              onClick={() => {
                if (onClose) onClose();
                return navigate('/settings/profile');
              }}
            />
          </Tooltip>
        ) : (
          ''
        )}
      </Stack>
    </Flex>
  );
});

const SidebarContent = observer(({ onClose, rest, testUser }) => {
  const { loggedIn } = useStore().authentication;
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const { pathname: location } = useLocation();
  return (
    <Flex flexDir={'column'} {...rest} p={4}>
      <CloseButton
        display={{ base: 'flex', lg: 'none' }}
        onClick={onClose}
        alignSelf="flex-end"
        size="lg"
      />
      <Stack spacing={2} p={2}>
        <Button
          leftIcon={<BiHomeAlt />}
          variant={'ghost'}
          justifyContent="flex-start"
          color={
            colorMode === 'dark'
              ? 'white'
              : location === '/home'
              ? 'brandDark'
              : 'brand'
          }
          fontWeight={location === '/home' ? '600' : 400}
          onClick={() => {
            if (onClose) onClose();
            return navigate('/home');
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
        {loggedIn || testUser?.loggedIn ? (
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
});
