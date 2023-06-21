import { Button, Flex, Stack } from '@chakra-ui/react';

import { TripPlanMap } from './TripPlanMap';
import { TripPlanSchedule } from './TripPlanSchedule';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../context/RootStore';

export const VerticalTripPlan = observer(
  ({
    tripPlan,
    tripRequest,
    scheduleTripHandler,
    backClickHandler,
    cancelClickHandler,
  }) => {
    return (
      <Flex
        id="vertical-trip-plan"
        flex={1}
        width={'100vw'}
        borderTop="solid thin lightgray"
        borderBottom="solid thin lightgray"
        height={'100%'}
        overflow={'hidden'}
      >
        <Flex
          flexDir={'column'}
          borderRight="solid thin lightgray"
          id="vertical-trip-plan-sidebar"
          w={{ base: '100%', md: '380px' }}
        >
          <Flex flexDir={'column'} overflow={'auto'} flex={1} py={2}>
            <TripPlanSchedule tripPlan={tripPlan} tripRequest={tripRequest} />
            <TripPlanScheduleButtons
              scheduleTripHandler={scheduleTripHandler}
              backClickHandler={backClickHandler}
              cancelClickHandler={cancelClickHandler}
            />
          </Flex>
        </Flex>

        <TripPlanMap tripPlan={tripPlan} flex={1} />
      </Flex>
    );
  }
);

const TripPlanScheduleButtons = observer(
  ({ scheduleTripHandler, backClickHandler, cancelClickHandler }) => {
    const { loggedIn } = useStore().authentication;
    return (
      <Stack spacing={4} alignItems="center" py={4} px={2}>
        {scheduleTripHandler && (
          <Button
            onClick={scheduleTripHandler ? scheduleTripHandler : null}
            colorScheme="blue"
            isDisabled={!loggedIn}
            width={'100%'}
          >
            Schedule Trip
          </Button>
        )}
        {cancelClickHandler && (
          <Button
            width={'100%'}
            variant={'solid'}
            colorScheme="red"
            onClick={cancelClickHandler}
          >
            Cancel Trip
          </Button>
        )}
        <Button width={'100%'} onClick={backClickHandler}>
          {scheduleTripHandler ? 'Back' : 'Close'}
        </Button>
      </Stack>
    );
  }
);
