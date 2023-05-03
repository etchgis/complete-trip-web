import {
  Navigate,
  Routes as ReactRoutes,
  Route,
  useLocation,
} from 'react-router-dom';
import { toJS, trace } from 'mobx';

import { Box } from '@chakra-ui/react';
import Home from './Home';
import Layout from './Layout';
import Settings from './Settings';
import TripLog from './TripLog';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useStore } from '../context/RootStore';

// import { toJS } from 'mobx';

export const Routes = observer(() => {
  //add trace if env is development
  if (process.env.NODE_ENV === 'development') {
    trace(false);
  }
  const { pathname } = useLocation();
  // const { locations, trips } = useStore().favorites;
  // const profile = useStore().profile;
  // const preferences = useStore().preferences;
  // const schedule = useStore().schedule;
  const { user, loggedIn, auth } = useStore().authentication;

  console.log('[routes] logged in:', loggedIn);
  // console.log('[routes] logging in:', loggingIn);

  //NOTE useEffect does not work with MobX 100%
  // useEffect(() => {
  //   if (!loggedIn) return;
  //   const _user = toJS(user);
  //   const _locations = toJS(locations);
  //   const _trips = toJS(trips);
  //   const _profile = toJS(profile);
  //   const _preferences = toJS(preferences);
  //   const _schedule = toJS(schedule);

  //   console.log({ _trips });
  //   console.log({ _user });
  //   console.log({ _locations });
  //   console.log({ _trips });
  //   console.log({ _profile });
  //   console.log({ _preferences });
  //   console.log({ _schedule });
  //   // eslint-disable-next-line
  // }, [user]);

  //INIT AUTH & USER 
  useEffect(() => {
    (async () => {
      if (user?.refreshToken && !loggedIn) {
        console.log('[routes] checking for auth');
        try {
          await auth(); //any errors will be handled by auth()
          if (user?.profile) {
            const _user = toJS(user);
            console.log({ _user })
          }
        } catch (error) {
          console.log(error); //TODO what happens here? Does the errorToastMessage show?
        }
      }
    })();
    // eslint-disable-next-line
  }, [loggedIn]);

  return (
    <ReactRoutes>
      {/* Redirect all trailing slashes */}
      <Route
        path={'/:url(/+)'}
        element={<Navigate to={pathname.slice(0, -1)} />}
      />
      {/* Home */}
      <Route path={'/'} element={<Layout children={<Home />}></Layout>} />

      {/* Trips */}
      <Route path={'/trips'} element={<Layout children={<TripLog />} />} />

      {/* Map */}
      <Route
        path={'/map'}
        element={<Layout isLoggedIn={loggedIn} showMap={true}></Layout>}
      />

      {/* Profile */}
      {loggedIn ? (
        <>
          <Route
            path={'/settings/profile'}
            element={
              <Layout isLoggedIn={loggedIn} children={<Settings />}></Layout>
            }
          />
          <Route
            path="/settings/caretakers"
            element={<Layout children={<Settings view="caretakers" />} />}
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
        <Route
          path="/settings/*"
          element={<Layout children={<Box p={10}></Box>} />}
        />
      )}
    </ReactRoutes>
  );
});
