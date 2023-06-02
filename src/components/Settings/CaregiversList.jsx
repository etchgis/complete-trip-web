import {
  Badge,
  Button,
  Card,
  CardBody,
  CardFooter,
  Divider,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react';

import { AddIcon } from '@chakra-ui/icons';
import ConfirmDialog from '../ConfirmDialog';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { useEffect } from 'react';
import { useStore } from '../../context/RootStore';

export const CaregiversList = observer(({ action }) => {
  const { caregivers, hydrate } = useStore().caregivers;

  const _caregivers = toJS(caregivers);
  console.log({ _caregivers });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <>
      <Stack spacing={6}>
        {caregivers.map((caregiver, i) => (
          <CaregiverCard
            key={i.toString()}
            caregiver={caregiver}
            action={() => {
              action(i);
            }}
          />
        ))}
      </Stack>

      <Button
        mt={6}
        variant={'outline'}
        color={'brand'}
        // bg={'brand'}
        // _hover={{
        //   opacity: '0.8',
        // }}
        leftIcon={<AddIcon />}
        onClick={() => action(null)}
      >
        Invite Caregiver
      </Button>
    </>
  );
});

export const CaregiverCard = ({ caregiver }) => {
  const { removeCaregiver: remove } = useStore().caregivers;
  const { setToastMessage, setToastStatus } = useStore().uiStore;

  const removeCaregiver = async id => {
    console.log({ id });
    try {
      await remove(id);
      setToastStatus('success');
      setToastMessage('Caregiver removed');
    } catch (error) {
      console.log(error); //TODO add error message
      setToastMessage('An error occurred removing the Caregiver.');
    }
  };

  return (
    <Card maxW="sm" variant={'outline'}>
      <CardBody>
        <Stack spacing="3">
          <Heading size="md">
            {caregiver?.firstName} {caregiver?.lastName}
          </Heading>
          {/* <Text>{formatters.phone.asDomestic(caregiver?.phone.slice(2))}</Text> */}
          <Text>{caregiver?.email}</Text>
        </Stack>
      </CardBody>
      <Divider />
      <CardFooter p={2} justifyContent={'space-between'} alignItems={'center'}>
        <ConfirmDialog
          title="Remove Caregiver"
          confirmText={'Remove'}
          buttonText={'Remove Caregiver'}
          message={"Are you sure? You can't undo this action."}
          confirmFn={() => removeCaregiver(caregiver?.id)}
        />

        {['pending', 'received', 'denied'].includes(caregiver?.status) ? (
          <Badge
            as="em"
            px={4}
            mx={4}
            colorScheme={
              caregiver?.status === 'pending'
                ? 'orange'
                : caregiver.status === 'denied'
                ? 'red'
                : 'green'
            }
          >
            {caregiver?.status.toUpperCase()}
          </Badge>
        ) : (
          ''
        )}
      </CardFooter>
    </Card>
  );
};
