import { Box, Container, Flex, Heading, Link, Stack, Text, useColorMode } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { PrivacyPolicy, TermsOfUse } from '../components/Settings/SettingsViews';
import useTranslation from '../models/useTranslation';

const LegalPageWrapper = ({ children }) => {
  const { colorMode } = useColorMode();
  
  return (
    <Box 
      minH="100vh" 
      bg={colorMode === 'light' ? 'gray.50' : 'gray.900'}
    >
      <Container maxW="container.lg" py={8}>
        {children}
      </Container>
    </Box>
  );
};

export const PublicTerms = () => {
  const { t } = useTranslation();
  
  return (
    <LegalPageWrapper>
      <Stack spacing={6}>
        <TermsOfUse />
        <Box borderTop="1px solid" borderColor="gray.200" pt={4}>
          <Link as={RouterLink} to="/privacy" color="brand">
            View Privacy Policy
          </Link>
          {' | '}
          <Link as={RouterLink} to="/map" color="brand">
            Return to App
          </Link>
        </Box>
      </Stack>
    </LegalPageWrapper>
  );
};

export const PublicPrivacy = () => {
  const { t } = useTranslation();
  
  return (
    <LegalPageWrapper>
      <Stack spacing={6}>
        <PrivacyPolicy />
        <Box borderTop="1px solid" borderColor="gray.200" pt={4}>
          <Link as={RouterLink} to="/terms" color="brand">
            View Terms of Service
          </Link>
          {' | '}
          <Link as={RouterLink} to="/map" color="brand">
            Return to App
          </Link>
        </Box>
      </Stack>
    </LegalPageWrapper>
  );
};
