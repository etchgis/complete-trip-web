import { Button, Flex } from '@chakra-ui/react';

import { observer } from 'mobx-react-lite';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../context/RootStore';

const Login = observer(() => {
  const setSearchParams = useSearchParams()[1];

  const { inTransaction } = useStore().authentication;

  return (
    <Flex justifyContent={'center'} alignSelf={'center'}>
      {inTransaction ? (
        ''
      ) : (
        <Button
          onClick={() => {
            setSearchParams({ login: 'true' });
          }}
          colorScheme="facebook"
          size="md"
          minWidth={'140px'}
        >
          Login
        </Button>
      )}
    </Flex>
  );
});

export default Login;
