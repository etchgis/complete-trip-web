import { Button, Flex } from '@chakra-ui/react';

import { observer } from 'mobx-react-lite';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../context/RootStore';
import useTranslation from '../models/useTranslation';

const Login = observer(() => {
  const setSearchParams = useSearchParams()[1];

  const { inTransaction } = useStore().authentication;
  const { t } = useTranslation();

  return (
    <Flex justifyContent={'center'} alignSelf={'center'}>
      {inTransaction ? (
        ''
      ) : (
        <Button
          onClick={() => {
            setSearchParams({ login: 'true' });
          }}
          variant={'brand'}
          size="md"
          minWidth={'140px'}
        >
          {t('loginWizard.login')}
        </Button>
      )}
    </Flex>
  );
});

export default Login;
