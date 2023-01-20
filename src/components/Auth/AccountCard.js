import { Box } from '@chakra-ui/react';
import { useAuthenticationStore } from '../../context/AuthenticationStoreZS';

export const AccountCard = () => {
  const user = useAuthenticationStore(e => e.user);
  return (
    <Box p={6}>
      <Box as="pre" wordBreak={'break-word'} whiteSpace="pre-wrap">
        {user ? JSON.stringify(user, null, 2) : ''}
      </Box>
    </Box>
  );
};
