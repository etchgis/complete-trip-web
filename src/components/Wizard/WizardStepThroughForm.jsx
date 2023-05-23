import {
  Box,
  Button,
  Flex,
  FormControl,
  Icon,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VisuallyHiddenInput,
  useColorMode,
} from '@chakra-ui/react';

import { BsCircleFill } from 'react-icons/bs';
import { useEffect } from 'react';
import { useState } from 'react';

export const WizardStepThroughForm = ({ content }) => {
  const { colorMode } = useColorMode();
  const steps = content || [
    { id: 'form1', content: <Box>1</Box>, step: 1 },
    { id: 'form2', content: <Box>2</Box>, step: 2 },
    { id: 'form3', content: <Box>3</Box>, step: 3 },
  ];
  const [tabIndex, setTabIndex] = useState(0);
  const [changed, setChanged] = useState(false);

  useEffect(() => {
    console.log({ changed });
  }, [changed]);

  useEffect(() => {
    setChanged(false);
    console.log({ changed });
    // eslint-disable-next-line
  }, [tabIndex]);

  return (
    <Tabs index={tabIndex} variant="unstyled">
      <TabPanels>
        {steps.map((s, i) => (
          <TabPanel key={i.toString()}>
            <Box
              as="form"
              id={s.id}
              onChange={() => setChanged(true)}
              onSubmit={async e => {
                e.preventDefault();
                if (s.action && i < steps.length - 1) {
                  const result = await s.action(e);
                  if (!result || result.error) return;
                  setTabIndex(i + 1);
                } else if (i < steps.length - 1) {
                  setTabIndex(i + 1);
                } else {
                  if (s.action) return s.action(e);
                  console.log(e);
                }
              }}
            >
              <FormControl>
                <VisuallyHiddenInput
                  name="changed"
                  value={changed}
                  onChange={() => {}}
                ></VisuallyHiddenInput>
              </FormControl>
              {s.content(tabIndex, setTabIndex)}
              <Stack mt={6} spacing={4}>
                {!s.hideButton ? (
                  <Button
                    bg={i === steps.length - 1 ? 'green.400' : 'brand'}
                    color="white"
                    _hover={{
                      opacity: 0.9,
                    }}
                    w="100%"
                    type="submit"
                  >
                    {i < steps.length - 1 && s.buttonText
                      ? s.buttonText
                      : i < steps.length - 1
                      ? 'Next'
                      : 'Verify Phone Number and Complete Setup'}
                  </Button>
                ) : null}
                {i > 0 && !s.hideButton ? (
                  <Button
                    borderColor={
                      colorMode === 'light' ? 'brandDark' : 'gray.400'
                    }
                    color={colorMode === 'light' ? 'brandDark' : 'gray.400'}
                    _hover={{
                      // backgroundColor: 'gray.100',
                      opacity: 0.9,
                    }}
                    variant="outline"
                    w="100%"
                    type="button"
                    onClick={() => setTabIndex(i - 1)}
                  >
                    Prev
                  </Button>
                ) : (
                  ''
                )}
              </Stack>
              {s.skip ? (
                <Flex mt={6}>
                  <Button
                    color={colorMode === 'light' ? 'brandDark' : 'gray.400'}
                    _hover={{
                      opacity: 0.9,
                    }}
                    w="100%"
                    type="button"
                    variant={'link'}
                    onClick={() => setTabIndex(i + 1)}
                  >
                    Skip
                  </Button>
                </Flex>
              ) : (
                ''
              )}
            </Box>
          </TabPanel>
        ))}
      </TabPanels>
      <TabList
        display="flex"
        justifyContent="center"
        // onChange={index => setTabIndex(index)}
        pointerEvents={'none'}
      >
        {steps.map((s, i) => (
          <Tab key={i.toString()}>
            <Flex
              direction="column"
              justify="center"
              align="center"
              position="relative"
            >
              <Icon
                as={BsCircleFill}
                color={tabIndex >= i ? 'brand' : 'gray.300'}
                w={4}
                h={4}
                mb={4}
              />
              {s.step ? (
                <Text
                  color={tabIndex >= i ? 'brand' : 'gray.300'}
                  fontWeight={tabIndex >= i ? 'bold' : 'normal'}
                  display={{ sm: 'none', md: 'block' }}
                  fontSize="sm"
                ></Text>
              ) : (
                ''
              )}
            </Flex>
          </Tab>
        ))}
      </TabList>
    </Tabs>
  );
};
