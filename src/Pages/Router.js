import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { Box } from '@chakra-ui/react';
import Home from './Home';
import Layout from '../Pages/Layout';
import Settings from '../components/Settings';
import TripLog from './TripLog';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { useEffect } from 'react';
import { useStore } from '../context/RootStore';

export const Router = observer(() => {
  const { pathname } = useLocation();
  //NOTE STORES

  const { locations, trips } = useStore().favorites;
  const profile = useStore().profile;
  const preferences = useStore().preferences;
  const schedule = useStore().schedule;
  const { user, loggedIn, loggingIn, fetchAccessToken } =
    useStore().authentication;

  console.log('[router] loggedIn', loggedIn);

  useEffect(() => {
    if (!loggedIn) return;
    const _user = toJS(user);
    const _locations = toJS(locations);
    const _trips = toJS(trips);
    const _profile = toJS(profile);
    const _preferences = toJS(preferences);
    const _schedule = toJS(schedule);

    console.log({ _trips });
    console.log({ _user });
    console.log({ _locations });
    console.log({ _trips });
    console.log({ _profile });
    console.log({ _preferences });
    console.log({ _schedule });
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    (async () => {
      if (user?.accessToken && !loggedIn) {
        console.log('[router] verifying accessToken');
        try {
          await fetchAccessToken();
          console.log('[router] verified accessToken', true);
        } catch (error) {
          console.log(error);
        }
      } else if (user?.accessToken && loggedIn) {
        return;
      } else {
        console.log('[router] no user or missing accessToken');
      }
    })();

    // eslint-disable-next-line
  }, [loggedIn]);

  return (
    <Routes>
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
          element={
            <Layout children={<Box p={10}>{loggingIn ? '' : ''}</Box>} />
          }
        />
      )}
    </Routes>
  );
});
