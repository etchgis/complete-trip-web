import {
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useStore } from '../context/RootStore';

const CargiverLink = observer(() => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    reset,
    inviteCode,
    setInviteCode,
    stagedDependent,
    update,
    validInvitedCaregiver,
  } = useStore().caregivers;
  const { user, loggedIn, inTransaction } = useStore().authentication;
  const { isLoading, setToastMessage, setToastStatus } = useStore().uiStore;

  useEffect(() => {
    // console.log('render', searchParams.get('code'), inviteCode);

    // REDIRECT IF THERE IS NO CODE OR STAGED CODE
    if (!searchParams.get('code') && !inviteCode) navigate('/');

    // SAVE THE CODE IN THE STORE
    if (searchParams.get('code')) {
      setInviteCode(searchParams.get('code'));
      setSearchParams({ invited: true });
    }

    if (searchParams.get('invited') && inviteCode) {
      console.log('[caregiver-link] - invited');
      if (loggedIn) updateHandler('received');
      onOpen();
    }

    if (!searchParams.get('invited') && !searchParams.get('code')) {
      console.log('no code');
    }

    // eslint-disable-next-line
  }, [loggedIn, searchParams]);

  useEffect(() => {
    console.log('[debug]', inviteCode);
  }, [inviteCode]);

  const updateHandler = async status => {
    console.log('[caregiver-link] - udpateHandler');
    console.log(`[caregiver-link] ${status}`);
    console.log(inviteCode);

    try {
      const validCaregiver = await validInvitedCaregiver(user?.email);
      if (!validCaregiver) throw new Error('invalid');

      const updatedCaregiver = await update(inviteCode, status);
      console.log({ updatedCaregiver });
      if (status === 'approved' || status === 'denied') {
        if (status === 'approved') setToastStatus('Success');
        if (status === 'denied') setToastStatus('Info');
        setToastMessage(`Caregiver request ${status}.`);
        navigate('/settings/dependents');
        onClose();
        reset();
      }
    } catch (error) {
      console.log({ error });
      setToastStatus('Error');
      if (error?.message?.startsWith('wrong-email:')) {
        const invitedEmail = error.message.split(':')[1];
        setInviteCode(null);
        setToastMessage(
          `This invitation was sent to ${invitedEmail}. Please log in with that email address to accept this invitation.`
        );
        navigate('/settings/profile'); //NOTE route the user here so they can see which email they are using
      } else {
        setToastMessage('An error occurred with the request.');
      }
    }
  };

  const loginHandler = () => {
    console.log('[caregiver-link] - loginHandler');
    setSearchParams({ login: true, invited: true });
  };

  return (
    <Modal isOpen={isOpen} size={'full'} blockScrollOnMount={false} style={{zIndex: 0}}>
      <ModalOverlay />
      <ModalContent>
        <ModalBody display={'flex'} p={0}>
          <Flex
            flex={1}
            alignItems={'center'}
            alignSelf="center"
            flexDir={'column'}
            maxW={'100%'}
            p={4}
          >
            <Box width={'320px'} maxW={'100%'}>
              {isLoading || inTransaction ? (
                <></>
              ) : loggedIn ? (
                <Box>
                  <Text>
                    You have been requested to be a caregiver
                    {stagedDependent?.firstName ? ' for' : '.'}
                    {stagedDependent?.firstName && (
                      <span style={{ fontWeight: 'bold' }}>
                        {' '}
                        {stagedDependent?.firstName} {stagedDependent?.lastName}
                        .
                      </span>
                    )}{' '}
                    Do you want to accept it?
                  </Text>
                  <Stack spacing={10} direction={['column', 'row']} my={8}>
                    <Button
                      colorScheme="facebook"
                      onClick={() => updateHandler('approved')}
                    >
                      Accept Request
                    </Button>
                    <Button
                      colorScheme="red"
                      onClick={() => updateHandler('denied')}
                    >
                      Deny Request
                    </Button>
                  </Stack>
                </Box>
              ) : (
                <Box>
                  <Text textAlign={'justify'}>
                    You have been requested to be a caregiver for All Access
                    App. Please login to view the request. If you do not have an
                    account, please register and you can review the request once
                    you complete the registration.
                  </Text>
                  <Stack spacing={10} direction={['column', 'row']} my={8}>
                    <Button
                      colorScheme="facebook"
                      onClick={loginHandler}
                      width="100%"
                    >
                      Login
                    </Button>
                    <Button
                      colorScheme="facebook"
                      variant={'outline'}
                      onClick={loginHandler}
                      width="100%"
                    >
                      Register
                    </Button>
                  </Stack>
                </Box>
              )}
            </Box>
          </Flex>
        </ModalBody>
        <ModalFooter></ModalFooter>
      </ModalContent>
    </Modal>
  );
});

export default CargiverLink;
