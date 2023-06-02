import { Flex, Grid, useColorMode, useDisclosure } from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import CustomModal from '../components/Modal';
import ErrorToastMessage from '../components/ErrorToastMessage';
import Loader from '../components/Loader';
import LoginRegister from '../components/LoginRegister';
import { MFAVerify } from '../components/MFA/MFAVerify';
import Map from './Map';
import Navbar from '../components/Navbar';
import ResponsiveSidebar from '../components/Sidebar';
import Wizard from '../components/Wizard';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useStore } from '../context/RootStore';

// import { useEffect } from 'react';

const Layout = observer(({ showMap, children }) => {
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const { code: inviteCode } = useStore().caregivers;
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loggedIn, inTransaction, requireMFA, auth, reset } =
    useStore().authentication;

  const { isLoading } = useStore().uiStore;
  const { trips } = useStore().schedule;

  // const _trips = toJS(trips);
  // console.log({ _trips });

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

  //////////////////////////
  // SPRINT 7 CAREGIVER LINK
  //////////////////////////

  // SHOW LOGIN MODAL USING QUERY PARAMS SO WE CAN OPEN IT FROM THE CAREGIVER LINK
  useEffect(() => {
    if (!loggedIn && searchParams.get('login')) {
      showLogin();
      setSearchParams({});
    }
    // eslint-disable-next-line
  }, [searchParams]);

  useEffect(() => {
    if (requireMFA) {
      hideLogin();
    }
  }, [requireMFA, hideLogin]);

  // // CLEAR QUERY PARAMS WHEN THE LOGIN MODAL IS CLOSED
  // useEffect(() => {
  //   if (!loginIsOpen && !loggedIn) {
  //     console.log('[layout] clearing params');
  //     setSearchParams({});
  //   }
  // }, []);

  // OPEN THE CAREGIVER LINK MODAL IF THE USER HAS A PENDING CAREGIVER CODE
  // REDIRECT TO HOME IF THE USER HAS TRIPS SCHEDULED
  useEffect(() => {
    if (loggedIn && inviteCode) {
      navigate('/caregiver?invited=true');
    } else if (loggedIn && user?.profile?.onboarded && trips.length) {
      navigate('/home');
    }
    // eslint-disable-next-line
  }, [loggedIn, trips]);

  return (
    <Flex
      id="app"
      backgroundColor={colorMode === 'light' ? 'white' : 'gray.800'}
      flexDir="column"
      display={{ base: 'none', sm: 'flex' }}
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
      <Grid gridTemplateColumns={{ base: '1fr', lg: '80px 1fr' }} flex="1">
        {/* SIDEBAR */}
        <ResponsiveSidebar
          isOpen={isOpen}
          onClose={onClose}
        ></ResponsiveSidebar>
        {/* MAP */}
        {/* NOTE the map is always loaded so we dont have to re-load it each time we navigate to the map route */}
        <Map showMap={showMap}></Map>
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
      ></MFAVerify>

      {/* ERROR TOAST MESSAGE */}
      <ErrorToastMessage></ErrorToastMessage>

      {/* LOADER */}
      <Loader isOpen={inTransaction || isLoading}></Loader>
    </Flex>
  );
});

export default Layout;
