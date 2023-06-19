import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  Flex,
  HStack,
  Heading,
  Icon,
  IconButton,
  Popover,
  PopoverAnchor,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Stack,
  Text,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';
import { FaCalendarAlt, FaEllipsisV } from 'react-icons/fa';

import ConfirmDialog from '../ConfirmDialog';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/RootStore';

export const DependentsListOld = observer(() => {
  const { dependents, hydrate } = useStore().caregivers;
  const navigate = useNavigate();
  console.log(toJS(dependents));

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!dependents.length) navigate('/settings/profile');
  }, [dependents, navigate]);

  return (
    <Box>
      <Stack spacing={6}>
        <Heading as="h2" size="lg">
          Dependents
        </Heading>
        {dependents.map((d, i) => (
          <DependentCard key={i} dependent={d} />
        ))}
        {dependents.length === 0 && <Text>No Dependents Found.</Text>}
      </Stack>
    </Box>
  );
});

const DependentCard = ({ dependent }) => {
  const { removeDependent: remove, update } = useStore().caregivers;
  const { setToastMessage, setToastStatus } = useStore().uiStore;
  const removeDependent = async id => {
    try {
      await remove(id);
      setToastStatus('success');
      setToastMessage('Dependent removed.');
    } catch (error) {
      setToastMessage('There was an error removing the dependent.');
    }
  };

  const updateHandler = async (id, status) => {
    console.log(`[caregiver] ${status}`);
    try {
      const result = await update(id, status);
      console.log({ result });
      if (status === 'approved') setToastStatus('Success');
      if (status === 'denied') setToastStatus('Info');
      setToastMessage(`Caregiver request ${status}.`);
    } catch (error) {
      console.log({ error });

      setToastMessage('An error occurred with the request.'); //TODO what to do here?
    }
  };

  return (
    <Card maxW="md" variant={'outline'}>
      <CardBody>
        <Heading as="h3" size="md">
          {dependent?.firstName} {dependent?.lastName}
        </Heading>
        <Text>{dependent?.email}</Text>
      </CardBody>
      <CardFooter p={2}>
        {dependent?.status === 'approved' ? (
          <ConfirmDialog
            title="Remove Dependent"
            confirmText={'Remove'}
            message="Are you sure you want to remove this dependent? This process cannot be undone."
            buttonText="Remove Dependent"
            confirmFn={() => removeDependent(dependent?.id)}
            // confirmFn={() => updateHandler(caregiver.id, 'pending')}
          />
        ) : (
          <Stack
            spacing={4}
            direction={['column', 'row']}
            alignItems={'center'}
          >
            <Button
              colorScheme="facebook"
              mr={2}
              onClick={() => updateHandler(dependent.id, 'approved')}
            >
              Approve Request
            </Button>
            <Button
              colorScheme="red"
              variant="outline"
              onClick={() => updateHandler(dependent.id, 'denied')}
            >
              Deny Request
            </Button>
            {/* <Badge as="em" px={4} mx={4} colorScheme="yellow">
              Pending
            </Badge> */}
          </Stack>
        )}
      </CardFooter>
    </Card>
  );
};

export const DependentsList = observer(({ dependents, trips }) => {
  const _d = toJS(dependents);
  console.log({ _d });
  const { onOpen, onClose, isOpen } = useDisclosure();
  const { colorMode } = useColorMode();
  const { removeDependent } = useStore().caregivers;
  const { setToastMessage, setToastStatus } = useStore().uiStore;
  const removeDependentHandler = async id => {
    try {
      await removeDependent(id);
      setToastStatus('success');
      setToastMessage('Dependent removed.');
    } catch (error) {
      setToastMessage('There was an error removing the dependent.');
    }
  };
  return (
    <Box>
      <Heading as="h2" size="md">
        Dependents List
      </Heading>
      <Box border="solid thin lightgray">
        <Accordion allowMultiple>
          {dependents.map((d, i) => (
            <AccordionItem key={i.toString()}>
              {({ isExpanded }) => (
                <>
                  <Flex>
                    <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
                      <PopoverTrigger>
                        <IconButton
                          aria-label="Delete Dependent"
                          variant={'ghost'}
                          borderRadius={0}
                          icon={<FaEllipsisV />}
                        />
                      </PopoverTrigger>
                      <PopoverContent>
                        <PopoverArrow />
                        <PopoverCloseButton />
                        <PopoverHeader>Delete Dependent</PopoverHeader>
                        <PopoverBody fontSize={'md'}>
                          <Text>
                            Are you sure you want to delete this dependent?
                          </Text>
                          <Box
                            p={4}
                            my={2}
                            background={
                              colorMode === 'light' ? 'gray.50' : 'gray.700'
                            }
                          >
                            <Text>
                              {d.firstName} {d.lastName}
                            </Text>
                            <Text> {d.email}</Text>
                          </Box>

                          <HStack justifyContent={'space-between'} py={2}>
                            <Button
                              type="submit"
                              colorScheme="blue"
                              variant={'outline'}
                              onClick={onClose}
                              size="sm"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => removeDependentHandler(d.id)}
                              colorScheme="red"
                              size="sm"
                            >
                              Delete Dependent
                            </Button>
                          </HStack>
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                    <AccordionButton>
                      <Box as="span" flex="1" textAlign="left">
                        {d.firstName} {d.lastName}
                      </Box>
                      {isExpanded ? (
                        <Icon
                          as={FaCalendarAlt}
                          color={'blue'}
                          fontSize="12px"
                        />
                      ) : (
                        <Icon as={FaCalendarAlt} fontSize="12px" />
                      )}
                    </AccordionButton>
                  </Flex>
                  <AccordionPanel pb={4} fontSize={'md'}>
                    {!trips.filter(t => t.dependent === d.dependent)
                      ?.length && <Box>No trips found.</Box>}
                    {trips
                      .filter(t => t.dependent === d.dependent)
                      .map((trip, i) => (
                        <Box key={i}>{trip?.destination}</Box>
                      ))}
                  </AccordionPanel>
                </>
              )}
            </AccordionItem>
          ))}
        </Accordion>
      </Box>
    </Box>
  );
});
