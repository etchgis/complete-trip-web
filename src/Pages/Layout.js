import { Flex, Grid, useColorMode, useDisclosure } from '@chakra-ui/react';

import CustomModal from '../components/Modal';
import Loader from '../components/Loader';
import LoginRegister from '../components/LoginRegister';
import MapboxMap from '../components/Map';
import Navbar from '../components/Navbar';
import ResponsiveSidebar from '../components/Sidebar';
import Wizard from '../components/Wizard';
import { observer } from 'mobx-react-lite';
import { useStore } from '../context/RootStore';

const Layout = observer(({ showMap, children }) => {
  const { colorMode } = useColorMode();
  const { user, loggedIn, inTransaction } = useStore().authentication;
  //Sidebar
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure();

  // console.log('Layout.js: ', profile);

  // LOGIN MODAL
  const {
    isOpen: loginIsOpen,
    onOpen: showLogin,
    onClose: hideLogin,
  } = useDisclosure();

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

      {/* LOADER */}
      <Loader isOpen={inTransaction}></Loader>
    </Flex>
  );
});

export default Layout;