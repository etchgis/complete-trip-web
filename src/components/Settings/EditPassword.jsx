import {
  Box,
  Button,
  Center,
  Divider,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  PinInput,
  PinInputField,
  Spacer,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  ViewIcon,
  ViewOffIcon,
  WarningTwoIcon,
} from '@chakra-ui/icons';

import { useEffect } from 'react';
import { useRef } from 'react';
import { useState } from 'react';
import { useStore } from '../../context/RootStore';
import useTranslation from '../../models/useTranslation';
import { validators } from '../../utils/validators';
import { set } from 'lodash';

// import ConfirmDialog from '../ConfirmDialog';

const { hasLowerCase, hasNumber, hasUpperCase } = validators;

export const EditPassword = () => {
  // const { colorMode } = useColorMode();
  const { user, updateUserProfile, updateUserPassword } = useStore().authentication;
  const preferences = user?.profile?.preferences || {};
  const { setToastMessage, setToastStatus } = useStore().uiStore;
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const passwordRef = useRef();
  const newPasswordTestRef = useRef();
  const [success, showSuccess] = useState(false);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const pinRef = useRef();
  const { t } = useTranslation();
  useEffect(() => {
    if (!success) return;
    setToastMessage(success);
    setToastStatus('Success');
    setTimeout(() => {
      showSuccess(null);
    }, 4000);
  }, [success]);

  useEffect(() => {
    newPasswordTestRef.current.setCustomValidity('');
    console.log(newPassword, newPasswordTestRef.current.value);
    if (
      newPasswordTestRef?.current?.value?.length > 7 &&
      newPassword !== newPasswordTestRef.current.value
    ) {
      return newPasswordTestRef.current.setCustomValidity(
        t('settingsPassword.errorMatch')
      );
    }
    if (newPassword === passwordRef.current.value) {
      return newPasswordTestRef.current.setCustomValidity(
        t('settingsPassword.errorSame')
      );
    }
  }, [newPassword]);

  // const forgotPasswordFn = () => {
  //   console.log('Forgot password');
  // };

  return (
    <Flex>
      <Box
        w={'100%'}
        maxW={{ base: '100%', md: 'md' }}
        as="form"
        onSubmit={async e => {
          e.preventDefault();
          const data = new FormData(e.target);
          const updatedPassword = await updateUserPassword(
            data.get('password'),
            data.get('new_password')
          );
          if (!updatedPassword || updatedPassword.error) {
            console.log(t('settingsPassword.error'));
          }
          showSuccess(t('settingsPassword.success'));
          setNewPassword('');
          e.target.reset();
        }}
      >
        <Stack spacing={4}>
          <FormControl isRequired>
            <FormLabel>{t('settingsPassword.current')}</FormLabel>
            <InputGroup>
              <Input
                ref={passwordRef}
                type={showPassword ? 'text' : 'password'}
                name={'password'}
                placeholder={t('settingsPassword.password')}
              />
              <InputRightElement h={'full'}>
                <Button
                  variant={'ghost'}
                  onClick={() => setShowPassword(showPassword => !showPassword)}
                >
                  {showPassword ? (
                    <ViewIcon aria-label={t('settingsPassword.hide')} />
                  ) : (
                    <ViewOffIcon aria-label={t('settingsPassword.show')} />
                  )}
                </Button>
              </InputRightElement>
            </InputGroup>
            {/* <Box fontSize={'md'} mt={'2'} textAlign={'right'}>
            <ConfirmDialog
              color={colorMode === 'light' ? 'brandDark' : 'gray.400'}
              as="span"
              variant={'link'}
              fontWeight="bold"
              buttonText={'Forgot Password'}
              confirmText={'Send Password Reset Link'}
              message={'This will send a link to your account email'}
              confirmFn={forgotPasswordFn}
            />
          </Box> */}
          </FormControl>

          <FormControl isRequired>
            <FormLabel>{t('settingsPassword.enter')}</FormLabel>
            <InputGroup>
              <Input
                type={showNewPassword ? 'text' : 'password'}
                name={'new_password'}
                placeholder={t('settingsPassword.newPassword')}
                pattern={
                  '(?=[A-Za-z0-9]+$)^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,}).*$'
                }
                value={newPassword}
                onChange={e => {
                  setNewPassword(e.target.value);
                }}
              />
              <InputRightElement h={'full'}>
                <Button
                  variant={'ghost'}
                  onClick={() =>
                    setShowNewPassword(showNewPassword => !showNewPassword)
                  }
                >
                  {showNewPassword ? (
                    <ViewIcon aria-label={t('settingsPassword.hide')} />
                  ) : (
                    <ViewOffIcon aria-label={t('settingsPassword.show')} />
                  )}
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>
          <Flex justifyContent={'space-around'} fontSize="md">
            <VStack
              spacing={0}
              color={newPassword.length > 7 ? 'ariaGreenText' : 'red.500'}
            >
              <Text fontSize={'lg'} fontWeight="bold">
                8+
              </Text>
              <Text color="ariaRedText">{t('settingsPassword.characters')}</Text>
              {newPassword.length > 7 ? (
                <CheckCircleIcon size="xs" />
              ) : (
                <WarningTwoIcon size="xs" />
              )}
            </VStack>
            <VStack
              spacing={0}
              color={hasUpperCase(newPassword) ? 'ariaGreenText' : 'red.500'}
            >
              <Text fontSize={'lg'} fontWeight="bold">
                A-Z
              </Text>
              <Text color="ariaRedText">{t('settingsPassword.uppercase')}</Text>
              {hasUpperCase(newPassword) ? (
                <CheckCircleIcon size="xs" />
              ) : (
                <WarningTwoIcon size="xs" />
              )}
            </VStack>
            <VStack
              spacing={0}
              color={hasLowerCase(newPassword) ? 'ariaGreenText' : 'red.500'}
            >
              <Text fontSize={'lg'} fontWeight="bold">
                a-z
              </Text>
              <Text color="ariaRedText">{t('settingsPassword.lowercase')}</Text>
              {hasLowerCase(newPassword) ? (
                <CheckCircleIcon size="xs" />
              ) : (
                <WarningTwoIcon size="xs" />
              )}
            </VStack>
            <VStack
              spacing={0}
              color={hasNumber(newPassword) ? 'ariaGreenText' : 'red.500'}
            >
              <Text fontSize={'lg'} fontWeight="bold">
                0-9
              </Text>
              <Text color="ariaRedText">{t('settingsPassword.number')}</Text>
              {hasNumber(newPassword) ? (
                <CheckCircleIcon size="xs" />
              ) : (
                <WarningTwoIcon size="xs" />
              )}
            </VStack>
          </Flex>
          <FormControl isRequired>
            <FormLabel>{t('settingsPassword.reEnter')}</FormLabel>
            <InputGroup>
              <Input
                ref={newPasswordTestRef}
                type={showNewPassword ? 'text' : 'password'}
                name={'new_password_test'}
                placeholder={t('settingsPassword.password')}
                onChange={e => {
                  newPasswordTestRef.current.setCustomValidity('');
                  if (e.target.value === passwordRef.current.value) {
                    return newPasswordTestRef.current.setCustomValidity(
                      t('settingsPassword.errorSame')
                    );
                  }
                  if (e.target.value !== newPassword) {
                    return newPasswordTestRef.current.setCustomValidity(
                      t('settingsPassword.errorMatch')
                    );
                  }
                }}
              />
            </InputGroup>
          </FormControl>
          <Button variant="brand" type="submit" mt={6}>
            {t('settingsPassword.submit')}
          </Button>
        </Stack>
        <Divider orientation='vertical' />
      </Box>
      <Box w={'25%'}>
        <Center height={'100%'}>
          <Divider orientation='vertical' />
        </Center>
      </Box>
      <Box
        w={'100%'}
        maxW={{ base: '100%', md: 'md' }}
        as="form"
        onSubmit={async e => {
          e.preventDefault();
          const data = new FormData(e.target);
          if (pin.length === 4) {
            const updatedProfile = await updateUserProfile({
              ...user?.profile,
              preferences: {
                ...preferences,
                pin: pin,
              },
            });
            console.log('updatedProfile', updatedProfile);
            // showSuccess(t('settingsPassword.success'));
            // setNewPassword('');
            setPin('');
            e.target.reset();
          }
        }}
      >
        <Stack spacing={4}>
          <Heading as='h4' size='md'>
            {t('settingsPassword.pinText')}
          </Heading>
          {preferences?.pin &&
            <>
              <Button
                variant={'ghost'}
                onClick={() =>
                  setShowPin(showPin => !showPin)
                }
              >
                {showPin ? (
                  <ViewIcon aria-label={t('settingsPassword.hide')} />
                ) : (
                  <ViewOffIcon aria-label={t('settingsPassword.show')} />
                )}
                <Text ml={4}>{t('settingsPassword.pin')}</Text>
              </Button>
              {showPin &&
                <Text textAlign={'center'} letterSpacing={12}>{preferences?.pin}</Text>
              }
              {!showPin &&
                <Text textAlign={'center'} letterSpacing={12}>****</Text>
              }
              <Divider />
            </>
          }
          {!preferences?.pin &&
            <Text textAlign={'center'}>Set your PIN now</Text>
          }
          <FormControl>
            <HStack>
              <Center w={'100%'}>
                <PinInput
                  otp
                  onChange={(e) => {
                    setPin(e);
                    console.log('e', e);
                  }}
                  name={'pin'}
                  size="lg"
                  value={pin}
                >
                  <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                  <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                  <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                  <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                </PinInput>
              </Center>
            </HStack>
          </FormControl>
          <Button variant="brand" type="submit" mt={6}>
            {t('settingsPassword.submitPin')}
          </Button>
        </Stack>
      </Box>
    </Flex>
  );
};
