import { Button, Flex, Stack } from '@chakra-ui/react';

import { Link } from 'react-router-dom';
import { MapboxMap } from '../components/Map/MapboxMap';

export const Views = () => {
  return (
    <Flex flex={1} justifyContent={'center'} alignItems="center">
      <Flex>
        <MapboxMap></MapboxMap>
      </Flex>
      <Stack id="views" spacing={8} alignItems="center" w="md">
        <Link to="splash">
          <Button size="lg" w="sm">
            Splash
          </Button>
        </Link>
        <Link to="signup">
          <Button size="lg" w="sm">
            Sign Up
          </Button>
        </Link>
        <Link to="steps">
          <Button size="lg" w="sm">
            Steps
          </Button>
        </Link>
        <Link to="welcome">
          <Button size="lg" w="sm">
            Welcome
          </Button>
        </Link>
        <Link to="reset">
          <Button size="lg" w="sm">
            Reset Password
          </Button>
        </Link>
      </Stack>
    </Flex>
  );
};
