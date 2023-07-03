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

export const TripPlanStandaloneModal = ({
  plan,
  request,
  title,
  backClickHandler,
  cancelClickHandler,
  isOpen,
  onClose,
}) => {
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
            backClickHandler={backClickHandler}
            cancelClickHandler={cancelClickHandler}
          />
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            variant={'ghost'}
            onClick={backClickHandler}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
