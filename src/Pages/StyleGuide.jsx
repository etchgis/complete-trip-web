import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Spacer,
  Stack,
  Switch,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningTwoIcon } from '@chakra-ui/icons';

import { BiHomeAlt } from 'react-icons/bi';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { useEffect } from 'react';
import { useStore } from '../context/RootStore';

const StyleGuide = observer(() => {
  const toast = useToast();
  const { ui, setUI } = useStore().uiStore;
  const _aaa = toJS(ui);
  console.log({ _aaa });

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

  //force all ui settings from ui store
  useEffect(() => {
    if (ui.contrast) {
      document.body.classList.add('contrast');
    } else {
      document.body.classList.remove('contrast');
    }
    if (ui.letterSpacing === 'md') {
      document.body.classList.add('letter-spacing-md');
    } else {
      document.body.classList.remove('letter-spacing-md');
    }
    if (ui.letterSpacing === 'lg') {
      document.body.classList.add('letter-spacing-lg');
    } else {
      document.body.classList.remove('letter-spacing-lg');
    }
  }, [ui]);

  return (
    <Flex
      w="calc(100% - 80px)"
      flexDir={'column'}
      id="styleguide"
      position="absolute"
      left={20}
    >
      <Flex
        gap={3}
        p={4}
        flexDir={{ base: 'column', sm: 'row' }}
        borderBottom={'solid thin lightgray'}
        w="100%"
      >
        <Button
          variant={ui.contrast ? 'brand' : 'outline'}
          onClick={() => {
            if (document.body.classList.contains('contrast')) {
              setUI({
                contrast: false,
              });
            } else {
              setUI({
                contrast: true,
              });
            }
          }}
        >
          Contrast
        </Button>

        {/* lg letter spacing */}
        <Button
          variant={ui.letterSpacing === 'lg' ? 'brand' : 'outline'}
          onClick={() => {
            if (document.body.classList.contains('letter-spacing-lg')) {
              setUI({
                letterSpacing: 'normal',
              });
            } else {
              setUI({
                letterSpacing: 'lg',
              });
            }
          }}
        >
          Lg Letter Spacing
        </Button>
      </Flex>
      <Flex flexDir="column" alignItems={'flex-start'} gap={4} p={4}>
        <Heading as="h1">h1 Style Guide</Heading>
        <Heading as="h2">h2 Heading</Heading>

        <Text>This is a paragraph.</Text>
        <Input
          w="320px"
          maxW="calc(100vw - 40px)"
          id="input"
          type="text"
          placeholder="Placeholder Text"
        />
        <IconButton
          icon={<BiHomeAlt />}
          aria-label="Icon"
          variant={'ghost'}
          fontSize={'32px'}
          color="brand"
          bg="gray.50"
          id="icon"
        />
        <Button variant="brand" minW="160px">
          Button Primary
        </Button>
        <Button
          variant="brand"
          boxShadow="0 0 0 3px rgba(0, 91, 204, 0.5)"
          minW="160px"
        >
          Button Hover
        </Button>
        <Button variant="brand" isDisabled={true} minW="160px">
          Primary Disabled
        </Button>
        <Button variant="error" minW="160px">
          Error
        </Button>
        <Button
          variant="error"
          minW="160px"
          boxShadow={'0 0 0 3px rgba(220, 53, 69, 0.5)'}
        >
          Error Hover
        </Button>
        <Button variant="error" minW="160px" isDisabled={true}>
          Error
        </Button>
        <Button minW="160px" colorScheme="gray">
          Gray
        </Button>
        <Button minW="160px" variant={'ghost'}>
          Ghost Button
        </Button>
        <Button variant="ghost" minW="160px" color="brand">
          Blue Ghost
        </Button>

        <Checkbox>Checkbox</Checkbox>
        <Checkbox defaultChecked={true}>Checkbox</Checkbox>
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

        <Text color="red.500" fontSize="sm">
          Error Text
        </Text>
        <Text color="ariaGreenText" fontSize="sm">
          Success Text
        </Text>
        <CheckCircleIcon size="xs" color={'ariaGreenText'} />
        <WarningTwoIcon size="xs" color="red.500" />
      </Flex>
    </Flex>
  );
});

export default StyleGuide;
