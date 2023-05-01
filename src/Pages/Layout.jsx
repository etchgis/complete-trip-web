import { Flex, Grid, useColorMode, useDisclosure } from '@chakra-ui/react';

import CustomModal from '../components/Modal';
import Loader from '../components/Loader';
import LoginRegister from '../components/LoginRegister';
import { MFAVerify } from '../components/MFA/MFAVerify';
import MapboxMap from '../components/Map';
import Navbar from '../components/Navbar';
import ResponsiveSidebar from '../components/Sidebar';
import Wizard from '../components/Wizard';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useStore } from '../context/RootStore';

// import { toJS } from 'mobx';
// import { useEffect } from 'react';

const Layout = observer(({ showMap, children }) => {
  const { colorMode } = useColorMode();
  const {
    user,
    updateUser,
    loggedIn,
    inTransaction,
    requireMFA,
    setRequireMFA,
    setInTransaction,
    auth,
    reset,
  } = useStore().authentication;

  if (loggedIn && !user?.profile?.onboarded)
    console.log('[layout] onboarded:', user?.profile?.onboarded);

  //SIDEBAR
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure();

  // MFA MPODAL
  const { onClose: closeMFA } = useDisclosure();

  // LOGIN MODAL
  const {
    isOpen: loginIsOpen,
    onOpen: showLogin,
    onClose: hideLogin,
  } = useDisclosure();

  useEffect(() => {
    if (requireMFA) {
      hideLogin();
    }
    // eslint-disable-next-line
  }, [requireMFA]);

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

      {/* MAIN SHELL */}
      <Grid gridTemplateColumns={{ base: '1fr', lg: '300px 1fr' }} flex="1">
        {/* SIDEBAR */}
        <ResponsiveSidebar
          isOpen={isOpen}
          onClose={onClose}
        ></ResponsiveSidebar>
        {/* MAP */}
        <MapboxMap showMap={showMap}></MapboxMap>
        {children}
      </Grid>

      {/* MODALS */}
      {/* LOGIN/REGISTER MODAL */}
      <CustomModal
        isOpen={loginIsOpen}
        onOpen={showLogin}
        onClose={hideLogin}
        size="lg"
      >
        {/* LOGIN/REGISTER MODAL */}
        <LoginRegister hideModal={hideLogin}></LoginRegister>
      </CustomModal>

      {/* ONBOARD WIZARD */}
      <CustomModal
        isOpen={
          (loggedIn && !user?.profile?.onboarded) ||
            user?.profile?.onboarded === false
            ? true
            : false
        }
        onOpen={showLogin}
        onClose={hideLogin}
        size="lg"
      >
        <Wizard hideModal={onClose} />
      </CustomModal>

      {/* MFA for Login and AuthToken Expire */}
      <MFAVerify
        isOpen={requireMFA}
        onClose={closeMFA}
        title="Get Authentication Code"
        callbackFn={async () => {
          try {
            await auth(); //NOTE any errors should be handled by the auth function - requireMFA are also handled there
          } catch (error) {
            console.log('[MFAVerify] error:', error);
            reset(); //NOTE the auth store should reset but we'll do it here just in case
          }
        }}
      />

      {/* LOADER */}
      <Loader isOpen={inTransaction}></Loader>
    </Flex>
  );
});

export default Layout;
