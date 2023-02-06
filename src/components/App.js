import { Flex, Grid, useColorMode, useDisclosure } from '@chakra-ui/react';

import { CustomModal } from './Modals/CustomModal';
import { Loader } from './Loader/Loader';
import { LoginRegisterStepForm } from './Auth/LoginForms';
import { MapboxMap } from './Map/MapboxMap';
import { Navbar } from './Navbar/Navbar';
import { ResponsiveSidebar } from './Sidebar/Sidebar';

// import { useEffect, useMemo } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';

// import { useAuthenticationStore } from '../context/AuthenticationStoreZS';

// import { Loader } from './Loader/Loader';

// function useQuery() {
//   const { search } = useLocation();

//   return useMemo(() => new URLSearchParams(search), [search]);
// }

export const App = ({ inTransaction, showMap, forceLogin, children }) => {
  const { colorMode } = useColorMode();
  // const { loggedIn } = useAuthenticationStore();
  // const navigate = useNavigate();
  // const search = useQuery();

  //Sidebar
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure();

  // LOGIN MODAL
  const {
    isOpen: loginIsOpen,
    onOpen: showLogin,
    onClose: hideLogin,
  } = useDisclosure();

  // useEffect(() => {
  //   if ((search.get('login') || forceLogin) && !loggedIn) {
  //     showLogin();
  //     // navigate('/', { replace: true });
  //   }
  //   //eslint-disable-next-line
  // }, []);

  return (
    <Flex
      id="app"
      backgroundColor={colorMode === 'light' ? 'white' : 'gray.800'}
      flexDir="column"
    >
      {/* NAV */}
      <Navbar
        isOpen={isOpen}
        onOpen={onOpen}
        onToggle={onToggle}
        onClose={onClose}
        action1={showLogin}
      ></Navbar>
      {/* <SimpleSidebar /> */}
      {/* SHELL */}
      <Grid gridTemplateColumns={{ base: '1fr', md: '300px 1fr' }} flex="1">
        {/* SIDEBAR */}

        <ResponsiveSidebar
          isOpen={isOpen}
          onClose={onClose}
        ></ResponsiveSidebar>
        <MapboxMap showMap={showMap}></MapboxMap>
        {children}
      </Grid>

      {/* MODALS */}
      <CustomModal
        isOpen={loginIsOpen}
        onOpen={showLogin}
        onClose={hideLogin}
        size="lg"
      >
        <LoginRegisterStepForm hideModal={hideLogin}></LoginRegisterStepForm>
      </CustomModal>

      <Loader isOpen={inTransaction}></Loader>
    </Flex>
  );
};
