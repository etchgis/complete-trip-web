import { AddIcon, CheckCircleIcon } from '@chakra-ui/icons';
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

import ConfirmDialog from '../ConfirmDialog';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { useEffect } from 'react';
import { useStore } from '../../context/RootStore';
import useTranslation from '../../models/useTranslation';

export const CaregiversList = observer(({ action }) => {
  const { caregivers, hydrate } = useStore().caregivers;

  const _caregivers = toJS(caregivers);
  console.log({ _caregivers });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const { t } = useTranslation();

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
        {t('settingsCaregivers.inviteCaregiver')}
      </Button>
    </>
  );
});

export const CaregiverCard = ({ caregiver }) => {
  const { removeCaregiver: remove } = useStore().caregivers;
  const { setToastMessage, setToastStatus } = useStore().uiStore;
  const { t } = useTranslation();
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
          <Heading size="md" display={'flex'} alignItems={'center'}>
            {caregiver?.firstName} {caregiver?.lastName}{' '}
            {caregiver?.status === 'approved' ? (
              <CheckCircleIcon color="ariaGreen" ml={2} />
            ) : (
              ''
            )}
          </Heading>
          {/* <Text>{formatters.phone.asDomestic(caregiver?.phone.slice(2))}</Text> */}
          <Text>{caregiver?.email}</Text>
        </Stack>
      </CardBody>
      <Divider aria-hidden={true} />
      <CardFooter p={2} justifyContent={'space-between'} alignItems={'center'}>
        <ConfirmDialog
          title={t('settingsCaregivers.removeCaregiver')}
          confirmText={t('settingsCaregivers.remove')}
          buttonText={t('settingsCaregivers.removeCaregiver')}
          message={t('settingsCaregivers.confirmRemove')}
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
            {t(`settingsCaregivers.${caregiver?.status.toLowerCase()}`)}
          </Badge>
        ) : (
          ''
        )}
      </CardFooter>
    </Card>
  );
};
