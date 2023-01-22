import { Route, Routes } from 'react-router-dom';

import { App } from '../components/App';
import { _alive } from '../helpers/helpers';
import { useAuthenticationStore } from '../context/AuthenticationStoreZS';
import { useEffect } from 'react';

function AppRoutes() {
  console.log('[routes]');

  const { user, loggedIn, validateUser } = useAuthenticationStore(
    state => state
  );

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
      {/* SPA Method - No routes */}
      <Route path={'/'} element={<App></App>}></Route>
      {/* <Route path="/views" element={<Views />} /> */}
      {/* <Route path="/splash" element={<Splash />} /> */}
      {/* <Route
    path="/welcome"
    element={loggedIn ? <Welcome /> : <Navigate to="/login" />}
  />
  <Route path="/reset" element={<ResetPassword />} />
  <Route path="/login" element={<Login login={true} />} />
  <Route path="/signup" element={<Login />} />
  <Route path="/steps" element={<StepsExample />} /> */}
    </Routes>
  );
}

export default AppRoutes;
