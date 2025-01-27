import { Navigate, Routes as ReactRoutes, Route, useSearchParams } from 'react-router-dom';
import { toJS, trace } from 'mobx';

import CaregiverLink from './CaregiverLink';
import Gleap from 'gleap';
import Layout from './Layout';
import Login from './Login';
import Settings from './Settings';
import StyleGuide from './StyleGuide.jsx';
import TripLog from './TripLog';
import { observer } from 'mobx-react-lite';
import useDependentTripNotifier from '../hooks/useDependentNotifier';
import useDependentTripSockets from '../hooks/useDependentTripSockets';
import { useEffect } from 'react';
import useNotifications from '../hooks/useNotifications';
import useRiderNotifier from '../hooks/useRiderNotifier';
import { useStore } from '../context/RootStore';
import HelpMobile from './HelpMobile.jsx';
import Help from './Help.jsx';
import HelpMobileEs from './HelpMobileEs.jsx';
import { LoginRegister } from '../components/LoginRegister/LoginRegister.jsx';
import config from '../config.js';
import { useState } from 'react';
import { useDisclosure } from '@chakra-ui/react';

export const Routes = observer(() => {
  //add trace if env is development
  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.NODE_ENV !== 'test'
  ) {
    trace(false);
  }
  const { user, loggedIn, auth, logout } = useStore().authentication;
  const { debug, setDebugMode, ui, setUI, setUX } = useStore().uiStore;
  const {
    onClose: hideLogin,
  } = useDisclosure();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlParams.entries());
    const { debug, mode } = params;
    if (debug) setDebugMode(debug === 'true' ? true : false);
    setUX(mode === 'kiosk' ? 'kiosk' : mode === 'callcenter' ? 'callcenter' : 'webapp');
  }, [setDebugMode, setUI, setUX]);

  if (debug) console.log('[routes] logged in:', loggedIn);

  //GLEAP
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlParams.entries());
    const { mode } = params;
    if (mode === 'webapp') {
      Gleap.initialize(import.meta.env.VITE_GLEAP);
      const gleapDivs = document.querySelectorAll('.gleap-font');
      if (gleapDivs.length > 0) {
        gleapDivs.forEach(div => {
          div.setAttribute('aria-hidden', 'true');
        });
      }
    }
  }, []);

  //INIT AUTH & USER
  useEffect(() => {
    console.log('[routes]', { cachedUser: user?.refreshToken ? true : false }, { loggedIn });
    console.log('[routes] checking for kiosk mode')
    const urlParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlParams.entries());
    const { mode } = params;
    if (mode && mode === 'kiosk') {
      console.log('[routes] in kiosk mode, logging out user if one exists')
      logout();
      return
    } else {
      console.log('[routes] not in kiosk mode')
    }

    (async () => {
      if (user?.refreshToken && !loggedIn) {
        if (debug) console.log('[routes] checking for auth');
        try {
          await auth(); //any errors will be handled by auth()
          setUI({ language: user?.profile?.preferences?.language || 'en' });
          if (user?.profile) {
            const _user = toJS(user);
            if (debug) console.log({ _user });
          }
        } catch (error) {
          console.log(error); //TODO what happens here? Does the errorToastMessage show?
        }
      }
    })();
    // eslint-disable-next-line
  }, [loggedIn]);

  //---------------------NOTIFICATIONS---------------------
  useRiderNotifier();
  useDependentTripNotifier();
  useDependentTripSockets();
  useNotifications();
  //---------------------NOTIFICATIONS---------------------

  //---------------------ACCESSIBILITY---------------------

  useEffect(() => {
    console.log('{sidebar--aaa-widget} ui update');

    if (ui.contrast) {
      document.body.classList.add('contrast');
    } else {
      document.body.classList.remove('contrast');
    }

    if (ui.letterSpacing === 'lg') {
      document.body.classList.add('letter-spacing-lg');
    } else {
      document.body.classList.remove('letter-spacing-lg');
    }

    if (ui.fontSize === 'med') {
      document.body.classList.add('fontsize-md');
      document.body.classList.remove('fontsize-lg');
    } else if (ui.fontSize === 'lg') {
      document.body.classList.add('fontsize-lg');
      document.body.classList.remove('fontsize-md');
    } else {
      document.body.classList.remove('fontsize-md');
      document.body.classList.remove('fontsize-lg');
    }

    if (ui.hideImages) {
      document.body.classList.add('hide-images');
    } else {
      document.body.classList.remove('hide-images');
    }

    if (ui.cursor === 'lg') {
      document.body.classList.add('cursor-lg');
    } else {
      document.body.classList.remove('cursor-lg');
    }
  }, [ui]);
  //---------------------ACCESSIBILITY---------------------

  // This route is just a shortcut for "/map?mode=callcenter"
  const CallCenterRoute = () => {
    useEffect(() => {
      setUX("callcenter");
    }, []);
  
    return <Layout showMap={true}></Layout>;
  };

  // Verify a new user that was sent an email invite
  const VerificationRoute = () => {
    const [verificationData, setVerificationData] = useState(null);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const data = urlParams.get('data');
  
      if (data) {
        fetch(`${config.SERVICES.verifications.url}/decoder/${encodeURIComponent(data)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': config.SERVICES.verifications.xApiKey,
          },
        })
        .then(async response => {
          const json = await response.json();
          const data = JSON.parse(json.data)
          setVerificationData(data);
        })
        .catch(err => {
          setError(err);
        });
      }
    }, []);
  
    if (error) return <div>Error processing verification</div>;
    if (!verificationData) return null;
  
    return <Layout isLoggedin={loggedIn} showMap={true} verify={verificationData} />;
  };
  
  return (
    <ReactRoutes>
      {/* Redirect all trailing slashes */}
      <Route path={'/:url(/+)'} element={<Navigate to={'/map'} />} />
      <Route path={'/'} element={<Navigate to={'/map'} />} />

      {/* STYLE GUIDE */}
      <Route
        path={'/styleguide'}
        element={<Layout children={<StyleGuide />} />}
      />

      {/* Map */}
      <Route
        path={'/map'}
        element={<Layout isLoggedIn={loggedIn} showMap={true}></Layout>}
      />

      {/* Callcenter shortcut */}
      <Route path="/callcenter" element={<CallCenterRoute />} />

      {/* CAREGIVER LINK */}
      <Route
        path={'/caregiver'}
        element={<Layout children={<CaregiverLink />}></Layout>}
      />
      {/* 
        <Route to={{ pathname: '/caregiver', search: `?id=${caregiverId}` }}>
         Go to caregiver
        </Route>
      */}

      <Route
        path={'/help'}
        element={
          <Help />
        }
      />

      <Route
        path={'/helpmobile'}
        element={
          <HelpMobile />
        }
      />

      <Route
        path={'/helpmobile-es'}
        element={
          <HelpMobileEs />
        }
      />

      <Route path="/verify" element={ <VerificationRoute/> } />

      {/* Profile */}
      {loggedIn ? (
        <>
          <Route path={'/home'} element={<Layout isHome={true}></Layout>} />

          <Route path={'/trips'} element={<Layout children={<TripLog />} />} />

          <Route
            path={'/settings/profile'}
            element={
              <Layout isLoggedIn={loggedIn} children={<Settings />}></Layout>
            }
          />
          <Route
            path="/settings/caregivers"
            element={<Layout children={<Settings view="caregivers" />} />}
          />
          <Route
            path="/settings/dependents"
            element={<Layout children={<Settings view="dependents" />} />}
          />
          <Route
            path="/settings/favorites"
            element={<Layout children={<Settings view="favorites" />} />}
          />
          <Route
            path="/settings/preferences"
            element={<Layout children={<Settings view="preferences" />} />}
          />
          <Route
            path="/settings/accessibility"
            element={<Layout children={<Settings view="accessibility" />} />}
          />
          <Route
            path="/settings/notifications"
            element={<Layout children={<Settings view="notifications" />} />}
          />
          <Route
            path="/settings/password"
            element={<Layout children={<Settings view="password" />} />}
          />
          <Route
            path="/settings/terms"
            element={<Layout children={<Settings view="terms" />} />}
          />
          {/* <Route
            path="/settings/privacy"
            element={<Layout children={<Settings view="privacy" />} />}
          /> */}
        </>
      ) : (
        <>
          {/* <Route
            path={'/home'}
            element={<Layout children={<Login />}></Layout>}
          />
          <Route path={'/trips'} element={<Layout children={<Login />} />} /> */}
          <Route path="/settings/*" element={<Layout children={<Login />} />} />
          <Route path="*" element={<Navigate to="/map" />} />
        </>
      )}
    </ReactRoutes>
  );
});
