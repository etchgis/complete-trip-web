import {
  Box,
  Button,
  Flex,
  IconButton,
  Image,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  ChevronRightIcon,
  CloseIcon,
  HamburgerIcon,
  Icon,
} from '@chakra-ui/icons';
import { useEffect, useState } from 'react';

import { ColorModeSwitcher } from '../ColorModeSwitcher/ColorModeSwitcher';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../context/RootStore';
import useTranslation from '../../models/useTranslation';
import { useNavigate } from 'react-router-dom';

// import logo from '../../assets/images/logo.png';

export const Navbar = observer(
  ({ isOpen, onToggle, action1, openTripWizard }) => {
    const { loggedIn, logout, user } = useStore().authentication;
    const { ux, clearKeyboardInputValues, setKeyboardActiveInput } =
      useStore().uiStore;
    const { t } = useTranslation();

    const navigate = useNavigate()

    useEffect(() => {
      console.log('[navbar] ux mode:', ux);
    }, [ux]);

    //NOTE this forces the language to be set on the navbar
    useEffect(() => {
      console.log(
        '[navbar] user language:',
        user?.profile?.preferences?.language.toString()
      );
    }, [user?.profile?.preferences]);

    const logoutWithNav = () => {
      logout()
      navigate('/map')
    }

    return (
      <Flex
        //BUG too dark
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}
        justifyContent={'space-between'}
      >
        <Flex>
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={'ghost'}
            aria-label={t('navbar.toggle')}
            mr={2}
            display={{ base: 'inline-flex', lg: 'none' }}
          />
          <Box
            as="span"
            bg={useColorModeValue('white', 'white')}
            p={1}
            borderRadius={'sm'}
          >
            <Image src={'/buffalo_logo_full.png'} h={8} alt="Buffalo Access" />
          </Box>
        </Flex>

        {ux === 'kiosk' && (
          <>
            <Button
              variant={'brand'}
              onClick={() => {
                clearKeyboardInputValues();
                setKeyboardActiveInput('startAddress');
                openTripWizard();
              }}
              minWidth={'180px'}
              width="auto"
            >
              {t('home.tripButton')}{' '}
              <Icon as={ChevronRightIcon} ml={2} boxSize={6} />
            </Button>

            <Box> </Box>
          </>
        )}

        <Flex display={(ux === 'webapp' || ux === 'callcenter') ? 'flex' : 'none'}>
          <Stack
            flex={{ base: 1, lg: 0 }}
            justify={'flex-end'}
            direction={'row'}
            spacing={6}
          >
            {ux === 'webapp' && 
              <Button
                variant={'brand'}
                minWidth={'135px'}
                // isLoading={loggingIn}
                // loadingText={'Logging In'}
                onClick={e => (loggedIn ? logoutWithNav() : action1(e))}
              >
                {loggedIn ? t('navbar.logout') : t('navbar.loginSignUp')}
              </Button>}
            {ux === 'callcenter' && 
              <Button
                variant={'brand'}
                minWidth={'135px'}
                // isLoading={loggingIn}
                // loadingText={'Logging In'}
                onClick={e => (action1(e))}
              >
                {t('navbar.createAccount')}
              </Button>}

            {/* <Button
            display={{ base: 'none', sm: 'inline-flex' }}
            // fontSize={'md'}
            // fontWeight={600}
            color={'white'}
            bg={'base'}
            // href={'#'}
            _hover={{
              opacity: '0.8',
            }}
            onClick={action2}
          >
            Sign Up
          </Button> */}
          </Stack>
          <ColorModeSwitcher />
        </Flex>
      </Flex>
    );
  }
);
