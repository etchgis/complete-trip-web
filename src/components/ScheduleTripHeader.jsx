import { Button, Icon, Stack, useDisclosure } from "@chakra-ui/react";

import { ChevronRightIcon } from "@chakra-ui/icons";
import ScheduleTripModal from "./ScheduleTripModal";
import { observer } from "mobx-react-lite"
import { useColorMode } from "@chakra-ui/color-mode";
import { useState } from "react";
import { useStore } from "../context/RootStore";

export const ScheduleTripHeader = observer(() => {
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
      <Stack
        direction={{ base: 'column', md: 'row' }}
        spacing={6}
        p={6}
        borderBottom={'1px'}
        borderColor={colorMode === 'light' ? 'gray.200' : 'gray.900'}
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
          backgroundColor={colorMode === 'light' ? 'trip' : 'trip'}
          color="white"
          _hover={{
            opacity: 0.8,
          }}
          onClick={openModal}
          width={'180px'}
          height={'80px'}
        >
          Schedule a Trip <Icon as={ChevronRightIcon} ml={2} boxSize={6} />
        </Button>
      </Stack >

      {/* TRIP SCHEDULER */}
      < ScheduleTripModal
        favoriteTrip={tripPlan}
        isOpen={isModalOpen}
        onClose={() => {
          setTripPlan({});
          closeModal();
        }}
      ></ScheduleTripModal >
    </>
  )
});

const FavoriteTripButton = ({ favorite, setTripPlan, openScheduleModal }) => {
  const { colorMode } = useColorMode();
  return (
    <Button
      _hover={{
        opacity: 0.8,
      }}
      onClick={() => {
        setTripPlan(favorite);
        openScheduleModal();
      }}
      width={'180px'}
      height={'80px'}
      whiteSpace={'break-spaces'}
      backgroundColor={colorMode === 'light' ? 'gray.100' : 'gray.900'}
      border="1px"
      borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
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