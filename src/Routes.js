import { Route, Routes } from 'react-router-dom';

import { App } from './components/App';
import { useAuthenticationStore } from './context/AuthenticationStoreZS';
import { useEffect } from 'react';

// import { Login } from './Views/Login';
// import { ResetPassword } from './Views/ResetPassword';
// import { Splash } from './Views/Splash';
// import { StepsExample } from './Views/StepsExample';
// import { Views } from './Views/index';
// import { Welcome } from './Views/Welcome';

// import { StepForm } from './Views/StepForm';

function AppRoutes() {
  const { user, validateUser } = useAuthenticationStore(state => state);
  console.log('[routes]');

  //NOTE validate user on initial load of app - the loggedIn value is not persisted
  useEffect(() => {
    if (user) validateUser(user);
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    console.log({ user });
  }, [user]);

  return (
    <Routes>
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
