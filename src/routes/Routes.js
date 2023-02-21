// import {
//   Autocomplete,
//   DownshiftExample,
//   DropdownSelect,
// } from '../components/Shared/Autocomplete';

import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { Box } from '@chakra-ui/react';
import Layout from '../components/Layout';
import Settings from '../components/Settings';
import Trips from '../components/Trips';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { useEffect } from 'react';
import { useStore } from '../context/mobx/RootStore';

export const AppRoutes = observer(() => {
  const { pathname } = useLocation();
  const {
    user,
    // updateUserProfile,
    loggedIn,
    loggingIn,
    fetchAccessToken,
  } = useStore().authentication;

  console.log('[routes] loggedIn', loggedIn);
  if (user?.profile) console.log(toJS(user));

  // useEffect(() => {
  //   console.log(toJS(user));
  // }, [user]);

  // useEffect(() => {
  //   if (!user?.profile) return;
  //   updateUserProfile(Object.assign({}, user?.profile, { onboarded: false }));
  // }, []);

  useEffect(() => {
    (async () => {
      if (user?.accessToken && !loggedIn) {
        console.log('[routes] verifying accessToken');
        try {
          await fetchAccessToken();
          console.log('[routes] success veryfing accessToken');
        } catch (error) {
          console.log(error);
        }
      } else if (user?.accessToken && loggedIn) {
        return;
      } else {
        console.log('[routes] no user or missing accessToken');
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
      <Route path={'/'} element={<Layout showMap={true}></Layout>} />

      {/* Trips */}
      <Route path={'/trips'} element={<Layout children={<Trips />} />} />

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
        // <Route path="/settings/*" element={<Navigate to={'/'}></Navigate>} />
      )}
      {/* default redirect to home page */}
      {/* <Route path="*" element={<Navigate to="/" />} /> */}
    </Routes>
  );
});

/*const [startTransition, isPending] = useTransition({
  timeoutMs: 3000,
  from: { opacity: 0 },
  enter: { opacity: 1 },
  leave: { opacity: 0 },
});

const MapComponent = () => {
  return (
    <div ref={mapContainer}>
      <Map ref={mapRef} {...mapProps} />
    </div>
  );
};

return (
  <Suspense fallback={<div>Loading...</div>}>
    <Switch>
      <Route exact path="/" onEnter={startTransition}>
        <HomePage />
      </Route>
      <Route exact path="/map" onEnter={startTransition}>
        <MapComponent />
      </Route>
    </Switch>
    {isPending && <LoadingIndicator />}
  </Suspense>
);*/
