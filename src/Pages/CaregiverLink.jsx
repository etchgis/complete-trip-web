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
import useTranslation from '../models/useTranslation';

const CaregiverLink = observer(() => {
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
  const { setToastMessage, setToastStatus } = useStore().uiStore;
  const { t } = useTranslation();

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
        setToastMessage(t('global.success', { status }));
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
        setToastMessage(t('settingsCaregivers.genericError'));
      }
    }
  };

  const loginHandler = () => {
    console.log('[caregiver-link] - loginHandler');
    setSearchParams({ login: true, invited: true });
  };

  const name = stagedDependent?.firstName
    ? `for ${stagedDependent?.firstName} ${stagedDependent?.lastName}`
    : '.';

  return (
    <Modal
      isOpen={isOpen}
      size={'full'}
      blockScrollOnMount={false}
      style={{ zIndex: 0 }}
    >
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
              {inTransaction ? (
                <></>
              ) : loggedIn ? (
                <Box>
                  <Text>{t('settingsCaregivers.linkMessage', { name })}</Text>
                  <Stack spacing={10} direction={['column', 'row']} my={8}>
                    <Button
                      colorScheme="facebook"
                      onClick={() => updateHandler('approved')}
                    >
                      {t('settingsCaregivers.acceptRequest')}
                    </Button>
                    <Button
                      colorScheme="red"
                      onClick={() => updateHandler('denied')}
                    >
                      {t('settingsCaregivers.denyRequest')}
                    </Button>
                  </Stack>
                </Box>
              ) : (
                <Box>
                  <Text textAlign={'justify'}>
                    {t('settingsCaregivers.linkMessageNoAccount')}
                  </Text>
                  <Stack spacing={10} direction={['column', 'row']} my={8}>
                    <Button
                      variant={'brand'}
                      onClick={loginHandler}
                      width="100%"
                    >
                      {t('loginWizard.login')}
                    </Button>
                    <Button
                      variant={'brand-outline'}
                      onClick={loginHandler}
                      width="100%"
                    >
                      {t('loginWizard.register')}
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

export default CaregiverLink;
