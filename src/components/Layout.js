import { Flex, Grid, useColorMode, useDisclosure } from '@chakra-ui/react';

import CustomModal from './Modal';
import Loader from './Loader';
import LoginRegister from './LoginRegister';
import MapboxMap from './Map';
import Navbar from './Navbar';
import ResponsiveSidebar from './Sidebar';
import Wizard from './Wizard';
import { observer } from 'mobx-react-lite';
import { useStore } from '../context/mobx/RootStore';

const Layout = observer(({ showMap, children }) => {
  const { colorMode } = useColorMode();
  const { user, loggedIn, inTransaction } = useStore().authentication;
  //Sidebar
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure();

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
