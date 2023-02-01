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
  Caretakers,
  EditAccessibility,
  EditProfile,
  Notifications,
  TripPreferences,
} from './SettingsForms';

import { SettingsPanel } from './SettingsPanel';
import { useAuthenticationStore } from '../../context/AuthenticationStoreZS';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

//TODO form logic for each form
//TODO actual Terms
//TODO actual Privacy Policy
//TODO actual values for user settings

export const Settings = ({ view }) => {
  const navigate = useNavigate();
  const { user } = useAuthenticationStore();
  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activePanel, setActivePanel] = useState();

  const panels = [
    {
      title: 'Profile Information',
      type: 'account',
      // el: <ProfileInformation action={() => setActivePanel('Edit Profile')} />,
      action: () => navigate('/profile/'),
    },
    {
      title: 'Edit Profile',
      type: 'hidden',
      el: <EditProfile />,
    },
    {
      title: 'Caretakers',
      type: 'account',
      // el: (
      //   <CaretakerCards
      //     caretakers={
      //       user?.profile?.caretakers || [
      //         {
      //           name: 'Jane Apple',
      //           phone: '555-555-5555',
      //           email: 'jane@example.com',
      //         },
      //       ]
      //     }
      //     action={() => Navigate('/profile/caretakers')}
      //   />
      // ),
      action: () => navigate('/profile/caretakers'),
    },
    {
      title: 'Edit Caretakers',
      type: 'hidden',
      el: <Caretakers />,
    },
    {
      title: 'Trip Preferences',
      type: 'account',
      el: <TripPreferences />,
    },
    // {
    //   title: 'Password',
    //   type: 'setting',
    //   el: <PasswordReset />,
    // },
    {
      title: 'Accessibility',
      type: 'setting',
      el: <Accessibility action={() => setActivePanel('Edit Accessibility')} />,
    },
    {
      title: 'Edit Accessibility',
      type: 'hidden',
      el: <EditAccessibility />,
    },
    {
      title: 'Notifications',
      type: 'setting',
      el: <Notifications />,
    },
    {
      title: 'Terms of Use',
      type: 'setting',
      el: <TermsOfUse />,
    },
    {
      title: 'Privacy Policy',
      type: 'setting',
      el: <PrivacyPolicy />,
      disabled: true,
    },
  ];

  return (
    <>
      <Grid p={8} gridTemplateColumns={{ base: '1fr', md: '340px 1fr' }}>
        <Box id="leftSettingsPanel">
          {/* <Stack direction="row" spacing={4} mb={4}>
            <Avatar size="lg"></Avatar>
            <Box>
              <Box fontWeight={900} fontSize={22}>
                Taylor Smith
              </Box>
              <Box>000-000-0000</Box>
            </Box>
          </Stack> */}
          <Stack spacing={2} ml={1}>
            <Heading as="h2" size="sm" py={4}>
              ACCOUNT
            </Heading>
            {panels.map((l, i) => {
              if (l.type === 'account') {
                return (
                  <Button
                    variant={'link'}
                    justifyContent="flex-start"
                    color={colorMode === 'light' ? 'brand' : 'white'}
                    width="200px"
                    key={i.toString()}
                    py={1}
                    onClick={() => {
                      if (l.action) return l.action();
                      setActivePanel(l.title);
                      onOpen();
                    }}
                    disabled={l.disabled ? true : false}
                  >
                    {l.title}
                  </Button>
                );
              } else {
                return '';
              }
            })}
            <Heading as="h2" size="sm" py={4}>
              SETTINGS
            </Heading>
            {panels.map((l, i) => {
              if (l.type === 'setting') {
                return (
                  <Button
                    variant={'link'}
                    justifyContent="flex-start"
                    color={colorMode === 'light' ? 'brand' : 'white'}
                    width="200px"
                    key={i.toString()}
                    py={1}
                    onClick={() => {
                      setActivePanel(l.title);
                      onOpen();
                    }}
                    isDisabled={l.disabled ? true : false}
                  >
                    {l.title}
                  </Button>
                );
              } else {
                return '';
              }
            })}
          </Stack>
        </Box>
        <Box id="rightSettingsPanel" py={5}>
          {view && view === 'caretakers' ? (
            <CaretakerCards caretakers={user?.profile?.caretakers || []} />
          ) : (
            <ProfileInformation></ProfileInformation>
          )}
        </Box>
      </Grid>
      <SettingsPanel
        isOpen={isOpen}
        onClose={onClose}
        title={activePanel}
        children={
          activePanel ? panels.find(l => l.title === activePanel).el : ''
        }
      />
    </>
  );
};
