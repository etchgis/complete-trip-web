import { Navigate, Routes as ReactRoutes, Route } from 'react-router-dom';
import { toJS, trace } from 'mobx';

import CargiverLink from './CargiverLink';
import Gleap from 'gleap';
import Home from './Home';
import Layout from './Layout';
import Login from './Login';
import Settings from './Settings';
import TripLog from './TripLog';
import { observer } from 'mobx-react-lite';
import useDependentTripNotifier from '../hooks/useDependentNotifier';
import useDependentTripSockets from '../hooks/useDependentTripSockets';
import { useEffect } from 'react';
import useNotifications from '../hooks/useNotifications';
import useRiderNotifier from '../hooks/useRiderNotifier';
import { useStore } from '../context/RootStore';

// import { toJS } from 'mobx';

export const Routes = observer(() => {
  //add trace if env is development
  if (
    process.env.NODE_ENV !== 'production' &&
    process.env.NODE_ENV !== 'test'
  ) {
    trace(false);
  }
  const { user, loggedIn, auth } = useStore().authentication;
  const { debug, setDebugMode } = useStore().uiStore;

  if (window && window.location) {
    const urlParams = new URLSearchParams(window.location.search);
    const debugMode = urlParams.get('debug');
    if (debugMode) setDebugMode(debugMode === 'true' ? true : false);
  }

  if (debug) console.log('[routes] logged in:', loggedIn);
  // console.log('[routes] logging in:', loggingIn);
  useEffect(() => {
    Gleap.initialize(import.meta.env.VITE_GLEAP);
  }, []);

  //INIT AUTH & USER
  useEffect(() => {
    (async () => {
      if (user?.refreshToken && !loggedIn) {
        if (debug) console.log('[routes] checking for auth');
        try {
          await auth(); //any errors will be handled by auth()
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

  return (
    <ReactRoutes>
      {/* Redirect all trailing slashes */}
      <Route path={'/:url(/+)'} element={<Navigate to={'/map'} />} />
      <Route path={'/'} element={<Navigate to={'/map'} />} />

      {/* Map */}
      <Route
        path={'/map'}
        element={<Layout isLoggedIn={loggedIn} showMap={true}></Layout>}
      />

      {/* CAREGIVER LINK */}
      <Route
        path={'/caregiver'}
        element={<Layout children={<CargiverLink />}></Layout>}
      />
      {/* 
        <Route to={{ pathname: '/caregiver', search: `?id=${caregiverId}` }}>
         Go to caregiver
        </Route>
      */}

      {/* Profile */}
      {loggedIn ? (
        <>
          <Route
            path={'/home'}
            element={<Layout children={<Home />}></Layout>}
          />

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
          <Route
            path="/settings/privacy"
            element={<Layout children={<Settings view="privacy" />} />}
          />
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
