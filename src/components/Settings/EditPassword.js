import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  ViewIcon,
  ViewOffIcon,
  WarningTwoIcon,
} from '@chakra-ui/icons';

import { useColorMode } from '@chakra-ui/color-mode';
import { useEffect } from 'react';
import { useRef } from 'react';
import { useState } from 'react';
import { useStore } from '../../context/RootStore';
import { validators } from '../../utils/validators';

const { hasLowerCase, hasNumber, hasUpperCase } = validators;

export const EditPassword = () => {
  const { colorMode } = useColorMode();
  const { updateUserPassword } = useStore().authentication;
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const passwordRef = useRef();
  const newPasswordTestRef = useRef();
  const [success, showSuccess] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!success) return;
    toast({
      title: 'Success',
      description: success,
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
      variant: 'top-accent',
    });
    setTimeout(() => {
      showSuccess(null);
    }, 4000);
  }, [success, toast]);

  useEffect(() => {
    newPasswordTestRef.current.setCustomValidity('');
    console.log(newPassword, newPasswordTestRef.current.value);
    if (
      newPasswordTestRef?.current?.value?.length > 7 &&
      newPassword !== newPasswordTestRef.current.value
    ) {
      return newPasswordTestRef.current.setCustomValidity(
        'Passwords do not match'
      );
    }
    if (newPassword === passwordRef.current.value) {
      return newPasswordTestRef.current.setCustomValidity(
        'Password cannot be the same as the current password'
      );
    }
  }, [newPassword]);

  return (
    <Box
      as="form"
      onSubmit={async e => {
        e.preventDefault();
        const data = new FormData(e.target);
        const updatedPassword = await updateUserPassword(
          data.get('password'),
          data.get('new_password')
        );
        if (!updatedPassword || updatedPassword.error) {
          console.log('Error updating password');
        }
        showSuccess('Password updated successfully');
        setNewPassword('');
        e.target.reset();
      }}
    >
      <Stack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Current Password</FormLabel>
          <InputGroup>
            <Input
              ref={passwordRef}
              type={showPassword ? 'text' : 'password'}
              name={'password'}
              placeholder={'Password'}
            />
            <InputRightElement h={'full'}>
              <Button
                variant={'ghost'}
                onClick={() => setShowPassword(showPassword => !showPassword)}
              >
                {showPassword ? <ViewIcon /> : <ViewOffIcon />}
              </Button>
            </InputRightElement>
          </InputGroup>
          <Box fontSize={'md'} mt={'2'} textAlign={'right'}>
            <Button
              color={colorMode === 'light' ? 'brandDark' : 'gray.400'}
              as="span"
              variant={'link'}
              fontWeight="bold"
            >
              Forgot your password?
            </Button>
          </Box>
        </FormControl>

        <Box py={6}>
          <Divider></Divider>
        </Box>

        <FormControl isRequired>
          <FormLabel>Enter a New Password</FormLabel>
          <InputGroup>
            <Input
              type={showNewPassword ? 'text' : 'password'}
              name={'new_password'}
              placeholder={'New Password'}
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
                {showNewPassword ? <ViewIcon /> : <ViewOffIcon />}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>
        <Flex justifyContent={'space-around'} fontSize="md">
          <VStack
            spacing={0}
            color={newPassword.length > 7 ? 'green.400' : 'red.400'}
          >
            <Text fontSize={'lg'} fontWeight="bold">
              8+
            </Text>
            <Text>Characters</Text>
            {newPassword.length > 7 ? (
              <CheckCircleIcon size="xs" />
            ) : (
              <WarningTwoIcon size="xs" />
            )}
          </VStack>
          <VStack
            spacing={0}
            color={hasUpperCase(newPassword) ? 'green.400' : 'red.400'}
          >
            <Text fontSize={'lg'} fontWeight="bold">
              A-Z
            </Text>
            <Text>Uppercase</Text>
            {hasUpperCase(newPassword) ? (
              <CheckCircleIcon size="xs" />
            ) : (
              <WarningTwoIcon size="xs" />
            )}
          </VStack>
          <VStack
            spacing={0}
            color={hasLowerCase(newPassword) ? 'green.400' : 'red.400'}
          >
            <Text fontSize={'lg'} fontWeight="bold">
              a-z
            </Text>
            <Text>Lowercase</Text>
            {hasLowerCase(newPassword) ? (
              <CheckCircleIcon size="xs" />
            ) : (
              <WarningTwoIcon size="xs" />
            )}
          </VStack>
          <VStack
            spacing={0}
            color={hasNumber(newPassword) ? 'green.400' : 'red.400'}
          >
            <Text fontSize={'lg'} fontWeight="bold">
              0-9
            </Text>
            <Text>Number</Text>
            {hasNumber(newPassword) ? (
              <CheckCircleIcon size="xs" />
            ) : (
              <WarningTwoIcon size="xs" />
            )}
          </VStack>
        </Flex>
        <FormControl isRequired>
          <FormLabel>Re-enter Password</FormLabel>
          <InputGroup>
            <Input
              ref={newPasswordTestRef}
              type={showNewPassword ? 'text' : 'password'}
              name={'new_password_test'}
              placeholder={'Password'}
              onChange={e => {
                newPasswordTestRef.current.setCustomValidity('');
                if (e.target.value === passwordRef.current.value) {
                  return newPasswordTestRef.current.setCustomValidity(
                    'Password cannot be the same as the current password'
                  );
                }
                if (e.target.value !== newPassword) {
                  return newPasswordTestRef.current.setCustomValidity(
                    'Passwords do not match'
                  );
                }
              }}
            />
          </InputGroup>
        </FormControl>
        <Button
          bg={'brand'}
          color={'white'}
          _hover={{
            opacity: 0.8,
          }}
          type="submit"
          mt={6}
        >
          Change Password
        </Button>
      </Stack>
    </Box>
  );
};