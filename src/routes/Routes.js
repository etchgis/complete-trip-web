// import {
//   Autocomplete,
//   DownshiftExample,
//   DropdownSelect,
// } from '../components/Shared/Autocomplete';

import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { App } from '../components/App';
import { Settings } from '../components/Settings/Settings';
import { Trips } from '../components/Trips/Trips';
import { _alive } from '../helpers/helpers';
import { useAuthenticationStore } from '../context/AuthenticationStoreZS';
import { useEffect } from 'react';

// import { AccountPage } from '../components/Auth/AccountPage';

export const AppRoutes = () => {
  console.log('[routes]');

  const { user, loggedIn, validateUser, inTransaction } =
    useAuthenticationStore(state => state);
  const { pathname } = useLocation();
  //NOTE validate user on initial load of app - the loggedIn value is not persisted
  useEffect(() => {
    if (_alive(user) && !loggedIn) validateUser(user);
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (_alive(user)) console.log({ user });
  }, [user]);

  return (
    <Routes>
      {/* Redirect all trailing slashes */}
      <Route
        path={'/:url(/+)'}
        element={<Navigate to={pathname.slice(0, -1)} />}
      />
      {/* Home */}
      <Route
        path={'/'}
        element={
          <App
            isLoggedIn={loggedIn}
            inTransaction={inTransaction}
            showMap={true}
          ></App>
        }
      />

      {/* Trips */}
      <Route
        path={'/trips'}
        element={
          <App
            isLoggedIn={loggedIn}
            inTransaction={inTransaction}
            children={<Trips />}
          />
        }
      />

      {/* Map */}
      <Route
        path={'/map'}
        element={
          <App
            isLoggedIn={loggedIn}
            inTransaction={inTransaction}
            showMap={true}
          ></App>
        }
      />
      {/* Profile */}
      {loggedIn ? (
        <>
          <Route
            path={'/settings/profile'}
            element={
              <App
                isLoggedIn={loggedIn}
                inTransaction={inTransaction}
                children={<Settings />}
              ></App>
            }
          />
          <Route
            path="/settings/caretakers"
            element={<App children={<Settings view="caretakers" />} />}
          />
          <Route
            path="/settings/preferences"
            element={<App children={<Settings view="preferences" />} />}
          />
          <Route
            path="/settings/accessibility"
            element={<App children={<Settings view="accessibility" />} />}
          />
          <Route
            path="/settings/notifications"
            element={<App children={<Settings view="notifications" />} />}
          />
          <Route
            path="/settings/terms"
            element={<App children={<Settings view="terms" />} />}
          />
          <Route
            path="/settings/privacy"
            element={<App children={<Settings view="privacy" />} />}
          />
        </>
      ) : (
        <Route path="/settings/*" element={<Navigate to={'/'}></Navigate>} />
      )}
      {/* default redirect to home page */}
      {/* <Route path="*" element={<Navigate to="/" />} /> */}
    </Routes>
  );
};

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
