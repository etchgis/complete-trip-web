import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';

import { useEffect } from 'react';
import { useState } from 'react';

export const CustomModal = ({
  isOpen,
  // onOpen,
  onClose,
  warning,
  title,
  size,
  children,
  rest,
}) => {
  const [alerted, setAlerted] = useState(false);
  const handleOnClose = () => {
    if (warning) {
      setAlerted(true);
      return warning;
    }
    onClose();
  };

  useEffect(() => {
    if (alerted) console.log('[modal] alerted', alerted);
  }, [alerted]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleOnClose}
      size={{ base: 'full', sm: size ? size : 'lg' }}
      // isCentered={isCentered || true}
      scrollBehavior={'inside'}
      isCentered
      {...rest}
      // closeOnOverlayClick={false}
    >
      <ModalOverlay className="js-custom-modal" />
      <ModalContent m={0} maxH={'calc(100% - 2rem)'}>
        {title ? <ModalHeader>{title}</ModalHeader> : ''}
        <ModalCloseButton style={{ filter: 'invert(1)' }} />
        <ModalBody p={0} id="modal--body" borderRadius={'10px'}>
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
