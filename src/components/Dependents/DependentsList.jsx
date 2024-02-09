import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  Icon,
  IconButton,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Stack,
  Text,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';
import { FaCalendarAlt, FaTrashAlt } from 'react-icons/fa';

import { CheckCircleIcon } from '@chakra-ui/icons';
import { DependentsTripsTable } from './DependentsTripsTable';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { useStore } from '../../context/RootStore';
import useTranslation from '../../models/useTranslation';

export const DependentsList = observer(() => {
  const { colorMode } = useColorMode();
  const {
    removeDependent,
    dependents,
    update: updateDepdentStatus,
  } = useStore().caregivers;
  const { hydrateDependentTrips } = useStore().schedule;
  const { setToastMessage, setToastStatus } = useStore().uiStore;

  const removeDependentHandler = async id => {
    try {
      await removeDependent(id);
      await hydrateDependentTrips();
      setToastStatus('success');
      setToastMessage('Dependent removed.');
    } catch (error) {
      setToastMessage('There was an error removing the dependent.');
    }
  };

  const updateHandler = async (id, status) => {
    console.log(`[dependent-list] ${status}`);
    try {
      const result = await updateDepdentStatus(id, status);
      await hydrateDependentTrips();
      console.log({ result });
      if (status === 'approved') setToastStatus('Success');
      if (status === 'denied') setToastStatus('Info');
      setToastMessage(`Caregiver request ${status}.`);
    } catch (error) {
      console.log({ error });
      setToastMessage('An error occurred with the request.');
    }
  };

  const sortedDependents = toJS(dependents).sort((a, b) =>
    a.firstName.localeCompare(b.firstName)
  );
  const { t } = useTranslation();
  return (
    <Box>
      <Heading as="h2" size="md">
        {t('settingsDependents.list')}
      </Heading>
      <Box
        border="solid thin lightgray"
        borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
      >
        <Accordion allowToggle>
          {sortedDependents.map((d, i) => (
            <AccordionItem
              key={i.toString()}
              isDisabled={d.status === 'received' ? true : false}
            >
              {({ isExpanded }) => (
                <>
                  <Flex alignItems={'center'} pr={2}>
                    <AccordionButton>
                      {isExpanded ? (
                        <Icon as={FaCalendarAlt} color={'brand'} />
                      ) : (
                        <Icon as={FaCalendarAlt} />
                      )}
                      <Flex
                        alignItems={'center'}
                        as="span"
                        flex={1}
                        textAlign="left"
                        ml={4}
                      >
                        {d.firstName} {d.lastName}
                        {d.status === 'approved' && (
                          <Icon as={CheckCircleIcon} color={'green'} ml={2} />
                        )}
                      </Flex>
                    </AccordionButton>
                    {d.status === 'received' && (
                      <Stack
                        spacing={4}
                        p={2}
                        direction={['column', 'row']}
                        alignItems={'center'}
                      >
                        <Badge as="em" colorScheme="yellow">
                          {t('settingsCaregivers.pending')}
                        </Badge>
                        <Button
                          colorScheme="green"
                          size="sm"
                          onClick={() => updateHandler(d.id, 'approved')}
                        >
                          {t('settingsCaregivers.approve')}
                        </Button>
                        <Button
                          colorScheme="red"
                          variant="outline"
                          size="sm"
                          onClick={() => updateHandler(d.id, 'denied')}
                        >
                          {t('settingsCaregivers.deny')}
                        </Button>
                      </Stack>
                    )}
                    <DeleteDependentPopover
                      dependent={d}
                      removeDependentHandler={removeDependentHandler}
                    />
                  </Flex>
                  <AccordionPanel
                    pb={4}
                    fontSize={'md'}
                    maxH="300px"
                    overflow={'auto'}
                  >
                    <DependentsTripsTable
                      dependent={d.id}
                      hideTitle={true}
                      limit={10}
                    />
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

const DeleteDependentPopover = ({ dependent: d, removeDependentHandler }) => {
  const { onOpen, onClose, isOpen } = useDisclosure();
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  return (
    <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose} placement="top">
      <PopoverTrigger>
        <IconButton
          aria-label="Delete Dependent"
          variant={'ghost'}
          borderRadius={0}
          icon={<FaTrashAlt />}
        />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>Delete Dependent</PopoverHeader>
        <PopoverBody fontSize={'md'}>
          <Text>Are you sure you want to delete this dependent?</Text>
          <Box
            p={4}
            my={2}
            background={colorMode === 'light' ? 'gray.50' : 'gray.700'}
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
              {t('global.cancel')}
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
  );
};
