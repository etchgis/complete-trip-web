import {
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Spinner,
} from '@chakra-ui/react';

import useTranslation from '../../models/useTranslation';

export const Loader = ({ isOpen }) => {
  const { t } = useTranslation();
  return (
    <Modal isOpen={isOpen} size="full">
      <ModalOverlay />
      <ModalContent bg="transparent">
        <ModalBody
          display={'flex'}
          alignItems={'center'}
          justifyContent={'center'}
          data-testid="loader"
        >
          <Flex>
            <Spinner
              thickness="6px"
              speed="0.65s"
              emptyColor="gray.200"
              color="brand"
              height="60px"
              width="60px"
              aria-label={t('global.loading')}
            />
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
