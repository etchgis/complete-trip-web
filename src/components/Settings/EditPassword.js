import {
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  useToast,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

import { useColorMode } from '@chakra-ui/color-mode';
import { useEffect } from 'react';
import { useRef } from 'react';
import { useState } from 'react';
import { useStore } from '../../context/mobx/RootStore';

export const EditPassword = () => {
  const { colorMode } = useColorMode();
  const { updateUserPassword } = useStore().authentication;
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const passwordRef = useRef();
  const newPassword = useRef();
  const newPasswordTest = useRef();
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
              ref={newPassword}
              type={showNewPassword ? 'text' : 'password'}
              name={'new_password'}
              placeholder={'New Password'}
              onChange={e => {
                //reset custom error message
                newPasswordTest.current.setCustomValidity('');
              }}
            />
            <InputRightElement h={'full'}>
              <Button
                variant={'ghost'}
                onClick={() =>
                  setShowNewPassword(showNewPassword => !showNewPassword)
                }
              >
                {showPassword ? <ViewIcon /> : <ViewOffIcon />}
              </Button>
            </InputRightElement>
          </InputGroup>
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Re-enter Password</FormLabel>
          <InputGroup>
            <Input
              ref={newPasswordTest}
              type={showNewPassword ? 'text' : 'password'}
              name={'new_password_test'}
              placeholder={'Password'}
              onChange={e => {
                //reset custom error message
                newPasswordTest.current.setCustomValidity('');
                if (e.target.value !== e.target.form.new_password.value) {
                  newPasswordTest.current.setCustomValidity(
                    'Passwords do not match'
                  );
                }
                if (e.target.value === passwordRef.current.value) {
                  newPasswordTest.current.setCustomValidity(
                    'Password cannot be the same as the current password'
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
