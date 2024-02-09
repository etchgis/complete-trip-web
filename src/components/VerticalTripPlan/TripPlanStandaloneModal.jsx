import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';

import { VerticalTripPlan } from './VerticalTripPlan';
import useTranslation from '../../models/useTranslation';

export const TripPlanStandaloneModal = ({
  plan,
  request,
  rider,
  title,
  backClickHandler,
  cancelClickHandler,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
      }}
      size="full"
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent textAlign={'center'} pt={0}>
        <ModalHeader>
          {title || 'Trip Plan Overview'}
          <ModalCloseButton p={6} />
        </ModalHeader>
        <ModalBody
          width="auto"
          minW={'100%'}
          maxW="100%"
          margin="0 auto"
          display={'flex'}
          flexDir={'column'}
          p={0}
        >
          <VerticalTripPlan
            tripPlan={plan}
            tripRequest={request}
            rider={rider}
            backClickHandler={backClickHandler}
            cancelClickHandler={cancelClickHandler}
          />
        </ModalBody>
        <ModalFooter
          justifyContent={'flex-start'}
          id="TripPlanStandaloneModalFooter"
        >
          <Button color="brand" variant={'ghost'} onClick={backClickHandler}>
            {t('global.close')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
