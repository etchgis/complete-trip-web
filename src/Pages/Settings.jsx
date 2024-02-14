import {
  Box,
  Button,
  Divider,
  Grid,
  Heading,
  Stack,
  Text,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FavoritesList,
  PrivacyPolicy,
  ProfileInformation,
  TermsOfUse,
} from '../components/Settings/SettingsViews';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { AddCaregiver } from '../components/Settings/AddCaregiver';
import { CaregiversList } from '../components/Settings/CaregiversList';
import { Dependents } from '../components/Dependents/Dependents';
import { EditAccessibility } from '../components/Settings/EditAccessibility';
import { EditAppNotifications } from '../components/Settings/EditAppNotifications';
import { EditPassword } from '../components/Settings/EditPassword';
import { EditProfile } from '../components/Settings/EditProfile';
import { EditTripPreferences } from '../components/Settings/EditTripPreferences';
import { SettingsModal } from '../components/Settings/SettingsModal';
import { observer } from 'mobx-react-lite';
import { useStore } from '../context/RootStore';
import useTranslation from '../models/useTranslation';

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

  const { t } = useTranslation();

  const links = [
    {
      title: t('settingsMenu.profile'),
      path: 'profile',
      type: 'account',
      action: () => navigate('/settings/profile'),
    },
    {
      title: t('settingsMenu.caregivers'),
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
      title: t('settingsMenu.dependents'),
      path: 'dependents',
      type: 'account',
      hide: !dependents.length,
      action: () => navigate('/settings/dependents'),
    },
    {
      title: t('settingsMenu.favorites'),
      path: 'favorites',
      type: 'account',
      action: () => navigate('/settings/favorites'),
    },
    {
      title: t('settingsMenu.tripPreferences'),
      path: 'preferences',
      type: 'account',
      action: () => navigate('/settings/preferences'),
    },
    {
      title: t('settingsMenu.password'),
      path: 'password',
      type: 'setting',
      action: () => navigate('/settings/password'),
    },
    {
      title: t('settingsMenu.accessibility'),
      type: 'setting',
      action: () => navigate('/settings/accessibility'),
    },
    {
      title: t('settingsMenu.notifications'),
      type: 'setting',
      action: () => navigate('/settings/notifications'),
    },
    {
      title: t('settingsMenu.terms'),
      path: 'terms',
      type: 'setting',
      action: () => navigate('/settings/terms'),
    },
    {
      title: t('settingsMenu.privacy'),
      path: 'privacy',
      type: 'setting',
      action: () => navigate('/settings/privacy'),
    },
  ];

  const settingsPanels = [
    {
      id: 'Edit Profile',
      title: t('settingsProfile.editProfile'),
      el: <EditProfile onClose={onClose} />,
    },
    {
      id: 'Remove Caregiver',
      title: t('settingsCaregivers.removeCaregiver'),
      el: <AddCaregiver id={caretakerId} onClose={onClose} />,
    },
    {
      id: 'Add Caregiver',
      title: t('settingsCaregivers.addCaregiver'),
      el: <AddCaregiver onClose={onClose} />,
    },
    {
      id: 'Trip Preferences',
      title: t('settingsPreferences.tripPreferences'),
      el: <EditTripPreferences />,
    },
    {
      id: 'Password',
      title: t('settingsPassword.editPassword'),
      el: <EditPassword />,
    },
    {
      id: 'Accessibility',
      title: t('settingsAccessibility.editAccessibility'),
      el: <EditAccessibility />,
    },
  ];

  const activePageRef = useRef(null);
  useEffect(() => {
    if (activePageRef.current) {
      console.log('setting focus');
      var focusable = activePageRef?.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      console.log(focusable);
      if (focusable?.length) {
        focusable[0].focus();
      }
    }
  }, [view]);

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
              {t('settingsMenu.account').toUpperCase()}
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
              {t('settingsMenu.settings').toUpperCase()}
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
            <Divider aria-hidden={true} />
          </Box>
        </Box>
        <Box
          id="rightSettingsPanel"
          p={{ base: 10, md: 10 }}
          maxW={{ base: '100%', md: '600px', lg: '1000px' }}
          ref={activePageRef}
        >
          <Text tabIndex={0} aria-label=""></Text>
          {switchViews({
            view,
            caregivers,
            setActivePanel,
          })}
        </Box>
      </Grid>
      <SettingsModal
        isOpen={isOpen}
        onClose={onClose}
        title={
          activePanel
            ? settingsPanels.find(
                l => l.title === activePanel || l?.id === activePanel
              )?.title
            : ''
        }
        children={
          activePanel
            ? settingsPanels.find(
                l => l.title === activePanel || l?.id === activePanel
              )?.el
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
      return <EditAccessibility />;
    case 'notifications':
      return <EditAppNotifications />;
    case 'terms':
      return <TermsOfUse />;
    case 'privacy':
      return <PrivacyPolicy />;
    case 'favorites':
      return <FavoritesList />;
    case 'dependents':
      return <Dependents />;
    default:
      return (
        <ProfileInformation
          action={() => setActivePanel('Edit Profile')}
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
