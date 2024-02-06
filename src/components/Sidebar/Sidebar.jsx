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

import AccessibilityWidget from './AccessibilityWidget';
import { BsPerson } from 'react-icons/bs';
import { CgCalendarToday } from 'react-icons/cg';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../context/RootStore';
import useTranslation from '../../models/useTranslation';

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
          <Box px={5}>
            <AccessibilityWidget showTitle={true} />
          </Box>
          {testContent ? testContent : null}
        </DrawerContent>
      </Drawer>
    </>
  );
};

const NavIconButton = ({ icon, label, navItem, onClick, ...rest }) => {
  const { colorMode } = useColorMode();
  const { pathname: location } = useLocation();
  const { t } = useTranslation();
  return (
    <Tooltip label={t(`sidebar.${label.toLowerCase()}`)}>
      <IconButton
        className="icon-button"
        aria-label={label}
        icon={icon}
        fontSize={'32px'}
        variant={'ghost'}
        onClick={onClick}
        color={
          colorMode === 'dark'
            ? 'white'
            : location === navItem
            ? 'brandDark'
            : 'brand'
        }
        bg={
          location === navItem
            ? colorMode === 'light'
              ? 'gray.50'
              : 'gray.700'
            : 'transparent'
        }
        {...rest}
      />
    </Tooltip>
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
            <NavIconButton
              label={'home'}
              icon={<BiHomeAlt />}
              navItem={'/home'}
              onClick={() => {
                if (onClose) onClose();
                return navigate('/home');
              }}
            />
            <NavIconButton
              label={'trips'}
              icon={<CgCalendarToday />}
              navItem={'/trips'}
              onClick={() => {
                if (onClose) onClose();
                return navigate('/trips');
              }}
            />
          </>
        ) : (
          ''
        )}
        <NavIconButton
          label={'map'}
          icon={<BiMapAlt />}
          navItem={'/map'}
          onClick={() => {
            if (onClose) onClose();
            return navigate('/map');
          }}
        />
        {loggedIn || testUser?.loggedIn ? (
          <NavIconButton
            label={'profile'}
            icon={<BsPerson />}
            navItem={'/settings'}
            onClick={() => {
              if (onClose) onClose();
              return navigate('/settings/profile');
            }}
          />
        ) : (
          ''
        )}

        <AccessibilityWidget />
      </Stack>
    </Flex>
  );
});

const SidebarContent = observer(({ onClose, rest, testUser }) => {
  const { loggedIn } = useStore().authentication;
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const { pathname: location } = useLocation();
  const { t } = useTranslation();
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
          bg={location === '/home' ? 'gray.50' : 'transparent'}
          fontWeight={location === '/home' ? '600' : 400}
          fontSize={'22px'}
          onClick={() => {
            if (onClose) onClose();
            return navigate('/home');
          }}
        >
          {t(`sidebar.home`)}
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
          bg={location === '/trips' ? 'gray.50' : 'transparent'}
          fontWeight={location === '/trips' ? '600' : 400}
          fontSize={'22px'}
          onClick={() => {
            if (onClose) onClose();
            return navigate('/trips');
          }}
        >
          {t(`sidebar.trips`)}
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
          bg={location === '/map' ? 'gray.50' : 'transparent'}
          fontWeight={location === '/map' ? '600' : 400}
          fontSize={'22px'}
          onClick={() => {
            if (onClose) onClose();
            return navigate('/map');
          }}
        >
          {t(`sidebar.map`)}
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
            bg={location.includes('/settings') ? 'gray.50' : 'transparent'}
            fontWeight={location.includes('/settings') ? '600' : 400}
            fontSize={'22px'}
            onClick={() => {
              if (onClose) onClose();
              return navigate('/settings/profile');
            }}
          >
            {t(`sidebar.profile`)}
          </Button>
        ) : (
          ''
        )}
      </Stack>
    </Flex>
  );
});
