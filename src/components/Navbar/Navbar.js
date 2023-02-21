import {
  Box,
  Button,
  Flex,
  IconButton,
  Image,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react';
import { CloseIcon, HamburgerIcon } from '@chakra-ui/icons';

import { ColorModeSwitcher } from '../ColorModeSwitcher/ColorModeSwitcher';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../context/mobx/RootStore';

// import logo from '../../assets/images/logo.png';

export const Navbar = observer(({ isOpen, onToggle, action1 }) => {
  const { loggedIn, logout, loggingIn } = useStore().authentication;
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
          aria-label={'Toggle Navigation'}
          mr={2}
          display={{ base: 'inline-flex', lg: 'none' }}
        />
        <Box
          as="span"
          bg={useColorModeValue('white', 'white')}
          p={1}
          borderRadius={'sm'}
        >
          <Image src={'/buffalo_logo_full.png'} h={8} />
        </Box>
      </Flex>

      <Flex>
        <Stack
          flex={{ base: 1, lg: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={6}
        >
          <Button
            color={'white'}
            bg={'brand'}
            _hover={{
              opacity: '0.8',
            }}
            minWidth={'135px'}
            isLoading={loggingIn}
            // loadingText={'Logging In'}
            onClick={e => (loggedIn ? logout() : action1(e))}
          >
            {loggedIn ? 'Logout' : 'Login/Sign Up'}
          </Button>

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
});
