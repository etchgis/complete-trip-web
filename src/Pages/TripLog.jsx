import { Box, Heading, useDisclosure } from '@chakra-ui/react';

import { TripPlanStandaloneModal } from '../components/VerticalTripPlan/TripPlanStandaloneModal';
import TripTable from '../components/TripTable';
import { useState } from 'react';
import { useStore } from '../context/RootStore';
import useTranslation from '../models/useTranslation';

const TripLog = () => {
  const {
    isOpen: isVTModalOpen,
    onOpen: openModal,
    onClose: closeVTModal,
  } = useDisclosure();
  const [selectedTrip, setSelectedTrip] = useState({});
  const { cancel } = useStore().schedule;
  const { t } = useTranslation();
  console.log(t('tripLog.title'));
  const cancelTrip = async id => {
    await cancel(id);
    close();
  };
  return (
    <>
      <Box p={6}>
        <Heading as="h2" size="md" mb={4}>
          {t('tripLog.title')}
        </Heading>
        <TripTable openModal={openModal} setSelectedTrip={setSelectedTrip} />
      </Box>
      {/* VERTICAL TRIP PLAN */}
      <TripPlanStandaloneModal
        request={selectedTrip?.plan?.request}
        plan={selectedTrip?.plan}
        isOpen={isVTModalOpen}
        onClose={closeVTModal}
        backClickHandler={closeVTModal}
        cancelClickHandler={async () => {
          await cancelTrip(selectedTrip?.id);
          closeVTModal();
        }}
      />
      {/* <CustomModal isOpen={isVTModalOpen} onClose={closeVTModal} size="full">
        <VerticalTripPlanModal
          title={selectedTrip?.request?.alias}
          descritption={selectedTrip.description}
          selectedTrip={selectedTrip}
          close={closeVTModal}
        />
      </CustomModal> */}
    </>
  );
};

export default TripLog;
