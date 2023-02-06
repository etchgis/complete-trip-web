import {
  Accessibility,
  CaretakerCards,
  PrivacyPolicy,
  ProfileInformation,
  TermsOfUse,
} from './SettingsViews';
import {
  Box,
  Button,
  Grid,
  Heading,
  Stack,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';
import {
  EditAccessibility,
  EditCaretakers,
  EditProfile,
  EditTripPreferences,
  Notifications,
} from './SettingsForms';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { SettingsModal } from './SettingsModal';
import { useAuthenticationStore } from '../../context/AuthenticationStoreZS';

//TODO form logic for each form
//TODO actual Terms
//TODO actual Privacy Policy
//TODO actual values for user settings

export const Settings = ({ view }) => {
  const navigate = useNavigate();
  const { user } = useAuthenticationStore();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activePanel, setActivePanel] = useState();

  useEffect(() => {
    if (activePanel) onOpen();
  }, [activePanel, onOpen]);

  useEffect(() => {
    if (!isOpen) setActivePanel(null);
  }, [isOpen]);

  const views = [
    {
      title: 'Profile Information',
      path: 'profile',
      type: 'account',
      action: () => navigate('/settings/profile'),
    },
    {
      title: 'Caretakers',
      path: 'caretakers',
      type: 'account',
      action: () => navigate('/settings/caretakers'),
    },
    {
      title: 'Trip Preferences',
      path: 'preferences',
      type: 'account',
      action: () => navigate('/settings/preferences'),
    },
    // {
    //   title: 'Password',
    //   type: 'setting',
    //   el: <PasswordReset />,
    // },
    {
      title: 'Accessibility',
      type: 'setting',
      action: () => navigate('/settings/accessibility'),
    },
    {
      title: 'Notifications',
      type: 'setting',
      action: () => navigate('/settings/notifications'),
    },
    {
      title: 'Terms of Use',
      path: 'terms',
      type: 'setting',
      action: () => navigate('/settings/terms'),
    },
    {
      title: 'Privacy Policy',
      path: 'privacy',
      type: 'setting',
      action: () => navigate('/settings/privacy'),
    },
  ];

  const settingsForms = [
    {
      title: 'Edit Profile Information',
      el: <EditProfile />,
    },
    {
      title: 'Edit Caretakers',
      el: <EditCaretakers />,
    },
    {
      title: 'Trip Preferences',
      el: <EditTripPreferences />,
    },
    {
      title: 'Edit Accessibility',
      el: <EditAccessibility />,
    },
  ];

  return (
    <>
      <Grid p={0} gridTemplateColumns={{ base: '1fr', md: '340px 1fr' }}>
        <Box
          id="leftSettingsPanel"
          borderRightColor={'brand'}
          borderRightWidth={'3px'}
        >
          <Stack spacing={4}>
            <Heading as="h2" size="sm" pt={8} px={8} ml={1}>
              ACCOUNT
            </Heading>
            {views.map((l, i) => {
              l['id'] = i;
              if (l.type === 'account') {
                return <LinkButton item={l} key={i.toString()} />;
              } else {
                return '';
              }
            })}
            <Heading as="h2" size="sm" px={8} ml={2}>
              SETTINGS
            </Heading>
            {views.map((l, i) => {
              l['id'] = i;
              if (l.type === 'setting') {
                return <LinkButton item={l} key={i.toString()} />;
              } else {
                return '';
              }
            })}
          </Stack>
        </Box>
        <Box id="rightSettingsPanel" p={10} maxW={'600px'}>
          {switchViews({ view, user, setActivePanel })}
        </Box>
      </Grid>
      <SettingsModal
        isOpen={isOpen}
        onClose={onClose}
        title={activePanel}
        children={
          activePanel ? settingsForms.find(l => l.title === activePanel).el : ''
        }
      />
    </>
  );
};

function switchViews({ view, user, setActivePanel }) {
  console.log(view);
  switch (view) {
    case 'caretakers':
      return <CaretakerCards caretakers={user?.profile?.caretakers || []} />;
    case 'preferences':
      return <EditTripPreferences />;
    case 'accessibility':
      return (
        <Accessibility action={() => setActivePanel('Edit Accessibility')} />
      );
    case 'notifications':
      return <Notifications />;
    case 'terms':
      return <TermsOfUse />;
    case 'privacy':
      return <PrivacyPolicy />;
    default:
      return <ProfileInformation></ProfileInformation>;
  }
}

function LinkButton({ item }) {
  const l = item;
  const { pathname } = useLocation();
  const { colorMode } = useColorMode();
  return (
    <Button
      borderRadius={0}
      variant={'link'}
      justifyContent="flex-start"
      width="100%"
      key={l.id.toString()}
      py={2}
      pl={8}
      onClick={() => {
        if (l.action) return l.action();
      }}
      disabled={l.disabled ? true : false}
      bg={
        pathname.includes(l.path) || pathname.includes(l.title.toLowerCase())
          ? 'brand'
          : 'transparent'
      }
      color={
        pathname.includes(l.path) || pathname.includes(l.title.toLowerCase())
          ? 'white'
          : colorMode === 'light'
          ? 'brand'
          : 'white'
      }
    >
      {l.title}
    </Button>
  );
}
