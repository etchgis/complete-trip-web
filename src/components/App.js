import { Flex, Grid, useColorMode, useDisclosure } from '@chakra-ui/react';

import CustomModal from './Modal';
import Loader from './Loader';
import LoginRegisterStepForm from './LoginRegisterStepForm';
import MapboxMap from './Map';
import Navbar from './Navbar';
import ResponsiveSidebar from './Sidebar';

export const App = ({ inTransaction, showMap, forceLogin, children }) => {
  const { colorMode } = useColorMode();

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
      <Grid gridTemplateColumns={{ base: '1fr', md: '300px 1fr' }} flex="1">
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
      <CustomModal
        isOpen={loginIsOpen}
        onOpen={showLogin}
        onClose={hideLogin}
        size="lg"
      >
        {/* LOGIN/REGISTER MODAL */}
        <LoginRegisterStepForm hideModal={hideLogin}></LoginRegisterStepForm>
      </CustomModal>

      {/* LOADER */}
      <Loader isOpen={inTransaction}></Loader>
    </Flex>
  );
};
