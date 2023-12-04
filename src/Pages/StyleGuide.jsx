import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Switch,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningTwoIcon } from '@chakra-ui/icons';

import { BiHomeAlt } from 'react-icons/bi';
import { useEffect } from 'react';

const StyleGuide = () => {
  const toast = useToast();

  useEffect(() => {
    toast({
      title: 'Toast Info!',
      description: 'This is a test of the toast system.',
      status: 'info',
      position: 'top-right',
      duration: 5000,
      isClosable: true,
      backgroundColor: 'brand',
    });
    toast({
      title: 'Toast Error!',
      description: 'This is a test of the toast system.',
      status: 'error',
      position: 'top-right',
      duration: 5000,
      isClosable: true,
    });
    toast({
      title: 'Toast Warning!',
      description: 'This fails AAA tests - not used.',
      status: 'warning',
      position: 'top-right',
      duration: 5000,
      isClosable: true,
      color: 'black',
    });
    toast({
      title: 'Toasts Success!',
      description: 'Colors set via the theme colors.',
      status: 'success',
      position: 'top-right',
      duration: 5000,
      isClosable: true,
    });
  }, []);
  return (
    <Box p={10} id="styleguide" position="absolute" left={20}>
      <VStack alignItems={'flex-start'}>
        <Heading as="h1">h1 Style Guide</Heading>
        <Heading as="h2">h2 Heading</Heading>

        <Text>This is a paragraph.</Text>
        <Input id="input" type="text" placeholder="Input" value="Input" />
        <IconButton
          icon={<BiHomeAlt />}
          aria-label="Icon"
          variant={'ghost'}
          fontSize={'32px'}
          color="brand"
          bg="gray.50"
          id="icon"
        />
        <Button variant="brand" w="160px">
          Button Primary
        </Button>
        <Button
          variant="brand"
          boxShadow="0 0 0 3px rgba(0, 91, 204, 0.5)"
          w="160px"
        >
          Button Hover
        </Button>
        <Button variant="brand" isDisabled={true} w="160px">
          Primary Disabled
        </Button>
        <Button variant="error" w="160px">
          Error
        </Button>
        <Button
          variant="error"
          w="160px"
          boxShadow={'0 0 0 3px rgba(220, 53, 69, 0.5)'}
        >
          Error Hover
        </Button>
        <Button variant="error" w="160px" isDisabled={true}>
          Error
        </Button>
        <Checkbox>Checkbox</Checkbox>
        <Checkbox defaultChecked={true}>Checkbox</Checkbox>
        <Checkbox isDisabled={true}>Checkbox</Checkbox>
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="switch1" mb="0" mr={7}>
            Switch Toggle
          </FormLabel>
          <Switch id="switch1" />
        </FormControl>
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="switch2" mb="0">
            Switch Checked
          </FormLabel>
          <Switch id="switch2" defaultChecked={true} />
        </FormControl>
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="switch3" mb="0">
            Switch Disabled
          </FormLabel>
          <Switch id="switch3" isDisabled={true} />
        </FormControl>
        <Text color="red.500" fontSize="sm">
          Error Text
        </Text>
        <Text color="ariaGreenText" fontSize="sm">
          Success Text
        </Text>
        <CheckCircleIcon size="xs" color={'ariaGreenText'} />
        <WarningTwoIcon size="xs" color="red.500" />
      </VStack>
    </Box>
  );
};

export default StyleGuide;
