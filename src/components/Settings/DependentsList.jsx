import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react';

import ConfirmDialog from '../ConfirmDialog';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/RootStore';

export const DependentsList = observer(() => {
  const { dependents, hydrate } = useStore().caregivers;
  const navigate = useNavigate();
  console.log(toJS(dependents));

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!dependents.length) navigate('/settings/profile');

  return (
    <Box>
      <Stack spacing={6}>
        <Heading as="h2" size="lg">
          Dependents
        </Heading>
        {dependents.map((d, i) => (
          <DependentCard key={i} caregiver={d} />
        ))}
        {dependents.length === 0 && <Text>No Dependents Found.</Text>}
      </Stack>
    </Box>
  );
});

const DependentCard = ({ caregiver }) => {
  const { dependent } = caregiver;
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
      if (status === 'approved') setToastStatus('success');
      if (status === 'denied') setToastStatus('warning');
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
        {caregiver.status === 'approved' ? (
          <ConfirmDialog
            title="Remove Dependent"
            confirmText={'Remove'}
            message="Are you sure you want to remove this dependent? This process cannot be undone."
            buttonText="Remove Dependent"
            confirmFn={() => removeDependent(caregiver.id)}
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
              onClick={() => updateHandler(caregiver.id, 'approved')}
            >
              Approve Request
            </Button>
            <Button
              colorScheme="red"
              variant="outline"
              onClick={() => updateHandler(caregiver.id, 'denied')}
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
