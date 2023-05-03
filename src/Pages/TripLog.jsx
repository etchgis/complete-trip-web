import { Box, Heading, useDisclosure } from '@chakra-ui/react';

import CustomModal from '../components/Modal';
import TripTable from '../components/TripTable';
import { VerticalTripPlanModal } from './Home';
import { useState } from 'react';

const TripLog = () => {
  const {
    isOpen: isVTModalOpen,
    onOpen: openModal,
    onClose: closeVTModal,
  } = useDisclosure();
  const [selectedTrip, setSelectedTrip] = useState({});

  return (
    <>
      <Box p={6}>
        <Heading as="h2" size="md" mb={4}>
          Trip Activity
        </Heading>
        <TripTable openModal={openModal} setSelectedTrip={setSelectedTrip} />
      </Box>
      {/* VERTICAL TRIP PLAN */}
      <CustomModal isOpen={isVTModalOpen} onClose={closeVTModal} size="full">
        <VerticalTripPlanModal
          title={selectedTrip?.request?.alias}
          descritption={selectedTrip.description}
          selectedTrip={selectedTrip}
          close={closeVTModal}
        />
      </CustomModal>
    </>
  );
};

export default TripLog;
