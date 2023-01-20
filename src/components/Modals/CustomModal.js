import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';

export const CustomModal = ({
  isOpen,
  // onOpen,
  onClose,
  title,
  size,
  children,
  rest,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: 'full', sm: size ? size : 'lg' }}
      {...rest}
      isCentered
      scrollBehavior={'inside'}
    >
      <ModalOverlay />
      <ModalContent m={0}>
        {title ? <ModalHeader>{title}</ModalHeader> : ''}
        <ModalCloseButton style={{ filter: 'invert(1)' }} />
        <ModalBody p={0} id='modal--body'>
          {children}
        </ModalBody>
        <ModalFooter>
          {/* <Button
            color="white"
            bg="base"
            _hover={{ opacity: 0.8 }}
            mr={3}
            onClick={onClose}
          >
            Close
          </Button> */}
          {/* <Button variant="ghost">Secondary Action</Button> */}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
