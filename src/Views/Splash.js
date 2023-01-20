import {
  Box,
  Button,
  Center,
  Flex,
  Image,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react';

import { Link } from 'react-router-dom';
import logo from '../assets/images/logo.png';

export const Splash = () => {
  return (
    <Flex
      id="login-card"
      justifyContent={'center'}
      alignItems="center"
      flex={1}
    >
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Flex
          rounded={'md'}
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow={'lg'}
          overflow="hidden"
          minH="75vh"
          flexDir={'column'}
        >
          <Center bg={useColorModeValue('blue.400', 'transparent')} p={8}>
            <Image src={logo}></Image>
          </Center>
          <Box flex={1}></Box>
          <Stack spacing={4} p={8}>
            <Box>
              <Stack spacing={4} pt={2}>
                <Link to="/login">
                  <Button
                    loadingText="Submitting"
                    size="lg"
                    variant={'solid'}
                    colorScheme="twitter"
                    w="100%"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    loadingText="Submitting"
                    size="lg"
                    variant={'outline'}
                    colorScheme="twitter"
                    w="100%"
                  >
                    Sign Up
                  </Button>
                </Link>
              </Stack>
            </Box>
          </Stack>
        </Flex>
      </Stack>
    </Flex>
  );
};
