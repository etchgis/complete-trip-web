import {
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Spinner,
} from '@chakra-ui/react';

export const Loader = ({ isOpen }) => {
  return (
    <Modal isOpen={isOpen} size="full">
      <ModalOverlay />
      <ModalContent bg="transparent">
        <ModalBody
          display={'flex'}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <Flex>
            <Spinner
              thickness="6px"
              speed="0.65s"
              emptyColor="gray.200"
              color="brand"
              height="60px"
              width="60px"
            />
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
