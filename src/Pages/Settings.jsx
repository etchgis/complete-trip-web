import {
  Accessibility,
  FavoritesList,
  PrivacyPolicy,
  ProfileInformation,
  TermsOfUse,
} from '../components/Settings/SettingsViews';
import {
  Box,
  Button,
  Divider,
  Grid,
  Heading,
  Stack,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { AddCaregiver } from '../components/Settings/AddCaregiver';
import { CaregiversList } from '../components/Settings/CaregiversList';
import { Dependents } from '../components/Dependents/Dependents';
import { DependentsDetail } from '../components/Dependents/DependentsDetail';
import { EditAccessibility } from '../components/Settings/EditAccessibility';
import { EditNotifications } from '../components/Settings/EditNotifications';
import { EditPassword } from '../components/Settings/EditPassword';
import { EditProfile } from '../components/Settings/EditProfile';
import { EditTripPreferences } from '../components/Settings/EditTripPreferences';
import { SettingsModal } from '../components/Settings/SettingsModal';
import { observer } from 'mobx-react-lite';
import { useStore } from '../context/RootStore';

const Settings = observer(({ view }) => {
  const navigate = useNavigate();
  const { caregivers, dependents } = useStore().caregivers;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activePanel, setActivePanel] = useState();
  const [caretakerId, setCaretakerId] = useState();

  useEffect(() => {
    if (activePanel) onOpen();
  }, [activePanel, onOpen]);

  useEffect(() => {
    if (!isOpen) setActivePanel(null);
  }, [isOpen]);

  const links = [
    {
      title: 'Profile Information',
      path: 'profile',
      type: 'account',
      action: () => navigate('/settings/profile'),
    },
    {
      title: 'Caregivers',
      path: 'caregivers',
      type: 'account',
      action: () => navigate('/settings/caregivers'),
    },
    // {
    //   title: 'Dependents',
    //   path: 'dependents',
    //   type: 'account',
    //   hide: !dependents.length,
    //   action: () => navigate('/settings/dependents'),
    // },
    {
      title: 'Dependents',
      path: 'dependents',
      type: 'account',
      hide: !dependents.length,
      action: () => navigate('/settings/dependents'),
    },
    {
      title: 'Favorites',
      path: 'favorites',
      type: 'account',
      action: () => navigate('/settings/favorites'),
    },
    {
      title: 'Trip Preferences',
      path: 'preferences',
      type: 'account',
      action: () => navigate('/settings/preferences'),
    },
    {
      title: 'Password',
      path: 'password',
      type: 'setting',
      action: () => navigate('/settings/password'),
    },
    {
      title: 'App Accessibility',
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
      el: <EditProfile onClose={onClose} />,
    },
    {
      title: 'Remove Caregiver',
      el: <AddCaregiver id={caretakerId} onClose={onClose} />,
    },
    {
      title: 'Add Caregiver',
      el: <AddCaregiver onClose={onClose} />,
    },
    {
      title: 'Trip Preferences',
      el: <EditTripPreferences />,
    },
    {
      title: 'Password',
      el: <EditPassword />,
    },
    {
      title: 'App Accessibility',
      el: <EditAccessibility />,
    },
  ];

  return (
    <>
      <Grid
        p={0}
        gridTemplateColumns={{ base: '1fr', md: '340px 1fr' }}
        height={{ base: 'fit-content', md: 'auto' }}
      >
        <Box
          id="leftSettingsPanel"
          borderRightColor={'brand'}
          borderRightWidth={'3px'}
        >
          <Stack spacing={4}>
            <Heading as="h2" size="sm" pt={8} px={8} ml={1}>
              ACCOUNT
            </Heading>
            {links.map((l, i) => {
              l['id'] = i;
              if (l.type === 'account' && !l?.hide) {
                return <LinkButton item={l} key={i.toString()} />;
              } else {
                return '';
              }
            })}
            <Heading as="h2" size="sm" px={8} ml={2}>
              SETTINGS
            </Heading>
            {links.map((l, i) => {
              l['id'] = i;
              if (l.type === 'setting') {
                return <LinkButton item={l} key={i.toString()} />;
              } else {
                return '';
              }
            })}
          </Stack>
          <Box mt={6} display={{ base: 'block', md: 'none' }}>
            <Divider />
          </Box>
        </Box>
        <Box
          id="rightSettingsPanel"
          p={{ base: 10, md: 10 }}
          maxW={{ base: '100%', md: '600px', lg: '1000px' }}
        >
          {switchViews({ view, caregivers, setActivePanel, setCaretakerId })}
        </Box>
      </Grid>
      <SettingsModal
        isOpen={isOpen}
        onClose={onClose}
        title={activePanel}
        children={
          activePanel
            ? settingsForms.find(l => l.title === activePanel)?.el
            : ''
        }
      />
    </>
  );
});

export default Settings;

function switchViews({ view, setActivePanel }) {
  // if (view) console.log('[settings]', view, 'view');
  switch (view) {
    case 'caregivers':
      return (
        <CaregiversList
          action={() => setActivePanel('Add Caregiver')}
          //   if (!id && id !== 0) {
          //     return setActivePanel('Add Caregiver');
          //   }
          //   setActivePanel('Remove Caregiver');
          //   setCaretakerId(id);
          // }}
        />
      );
    case 'preferences':
      return <EditTripPreferences />;
    case 'password':
      return <EditPassword />;
    case 'accessibility':
      return (
        <Accessibility action={() => setActivePanel('App Accessibility')} />
      );
    case 'notifications':
      return <EditNotifications />;
    case 'terms':
      return <TermsOfUse />;
    case 'privacy':
      return <PrivacyPolicy />;
    case 'favorites':
      return <FavoritesList />;
    case 'dependents':
      return <Dependents />;
    case 'dependents-detail':
      return <DependentsDetail />;
    default:
      return (
        <ProfileInformation
          action={() => setActivePanel('Edit Profile Information')}
        ></ProfileInformation>
      );
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
