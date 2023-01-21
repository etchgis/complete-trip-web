import { Flex, useColorMode, useDisclosure } from '@chakra-ui/react';

import { AccountCard } from './Auth/AccountCard';
import { CustomModal } from './Modals/CustomModal';
import { LoginRegisterStepForm } from './Auth/LoginForms';
import { MapboxMap } from './Map/MapboxMap';
import Navbar from './Navbar/Navbar';

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
      <CustomModal
        isOpen={accountIsOpen}
        onOpen={showAccount}
        onClose={hideAccount}
        size="3xl"
      >
        <AccountCard />
      </CustomModal>
    </Flex>
  );
};
