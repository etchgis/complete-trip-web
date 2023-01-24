import { Flex, useColorMode, useDisclosure } from '@chakra-ui/react';

import { AccountSettings } from './Auth/AccountSettings';
import { CustomModal } from './Modals/CustomModal';
import { LoginRegisterStepForm } from './Auth/LoginForms';
import { MapboxMap } from './Map/MapboxMap';
import Navbar from './Navbar/Navbar';

// import { Loader } from './Loader/Loader';

export const App = () => {
  const { colorMode } = useColorMode();

  // LOGIN MODAL
  const {
    isOpen: loginIsOpen,
    onOpen: showLogin,
    onClose: hideLogin,
  } = useDisclosure();

  // ACCOUNT MODAL
  const {
    isOpen: accountIsOpen,
    onOpen: showAccount,
    onClose: hideAccount,
  } = useDisclosure();

  return (
    <Flex
      id="app"
      backgroundColor={colorMode === 'light' ? 'white' : 'gray.800'}
      flexDir="column"
    >
      {/* NAV */}
      <Navbar action1={showLogin} action2={showAccount}></Navbar>

      {/* MAP */}
      <MapboxMap></MapboxMap>

      {/* MODALS */}
      <CustomModal
        isOpen={loginIsOpen}
        onOpen={showLogin}
        onClose={hideLogin}
        size="lg"
      >
        <LoginRegisterStepForm hideModal={hideLogin}></LoginRegisterStepForm>
      </CustomModal>
      <AccountSettings isOpen={accountIsOpen} onClose={hideAccount} />
    </Flex>
  );
};
