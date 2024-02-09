import { Button, Flex, Icon, Stack, useDisclosure } from '@chakra-ui/react';

import { ChevronRightIcon } from '@chakra-ui/icons';
import ScheduleTripModal from '../ScheduleTripModal';
import { observer } from 'mobx-react-lite';
import { useColorMode } from '@chakra-ui/color-mode';
import { useState } from 'react';
import { useStore } from '../../context/RootStore';
import useTranslation from '../../models/useTranslation';

export const ScheduleTripHeader = observer(() => {
  const { t } = useTranslation();
  const { trips: favoriteTrips } = useStore().favorites;
  const { colorMode } = useColorMode();
  const [tripPlan, setTripPlan] = useState({});
  const {
    isOpen: isModalOpen,
    onOpen: openModal,
    onClose: closeModal,
  } = useDisclosure();
  return (
    <>
      {/* HEADER */}
      <Flex
        spacing={4}
        p={4}
        borderBottom={'1px'}
        borderColor={colorMode === 'light' ? 'gray.200' : 'gray.900'}
        flexWrap={'wrap'}
      >
        {favoriteTrips.map(trip => (
          <FavoriteTripButton
            key={trip.id.toString()}
            favorite={trip}
            setTripPlan={setTripPlan}
            openScheduleModal={openModal}
          />
        ))}
        <Button
          variant={'brand'}
          onClick={openModal}
          minWidth={'180px'}
          width="auto"
          height={'80px'}
          m={2}
        >
          {t('home.tripButton')}{' '}
          <Icon as={ChevronRightIcon} ml={2} boxSize={6} />
        </Button>
      </Flex>

      {/* TRIP SCHEDULER */}
      <ScheduleTripModal
        favoriteTrip={tripPlan}
        isOpen={isModalOpen}
        onClose={() => {
          setTripPlan({});
          closeModal();
        }}
      ></ScheduleTripModal>
    </>
  );
});

const FavoriteTripButton = ({ favorite, setTripPlan, openScheduleModal }) => {
  const { colorMode } = useColorMode();
  return (
    <Button
      data-name="fav-trip-button"
      _hover={{
        opacity: 0.8,
      }}
      onClick={() => {
        setTripPlan(favorite);
        openScheduleModal();
      }}
      minWidth={'180px'}
      width="auto"
      height={'80px'}
      whiteSpace={'break-spaces'}
      backgroundColor={colorMode === 'light' ? 'gray.100' : 'gray.900'}
      border="1px"
      borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
      m={2}
    >
      {trimText(favorite.alias)}
      <Icon as={ChevronRightIcon} ml={2} boxSize={6} />
    </Button>
  );
};

function trimText(text) {
  if (!text) return text;
  if (text.length > 30) {
    return text.substring(0, 30) + '...';
  }
  return text;
}
