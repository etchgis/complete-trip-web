import { Box, Button, Flex, Stack } from '@chakra-ui/react';

import { TripPlanMap } from './TripPlanMap';
import { TripPlanSchedule } from './TripPlanSchedule';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../context/RootStore';

export const VerticalTripPlan = observer(
  ({ tripPlan, tripRequest, scheduleTripHandler, backClickHandler }) => {
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
          <Box overflow={'auto'}>
            <TripPlanScheduleButtons
              scheduleTripHandler={scheduleTripHandler}
              backClickHandler={backClickHandler}
            />
            <TripPlanSchedule tripPlan={tripPlan} tripRequest={tripRequest} />
          </Box>
        </Flex>

        <TripPlanMap tripPlan={tripPlan} flex={1} />
      </Flex>
    );
  }
);

const TripPlanScheduleButtons = observer(
  ({ scheduleTripHandler, backClickHandler }) => {
    const { loggedIn } = useStore().authentication;
    return (
      <Stack spacing={4} alignItems="center" py={4} px={2}>
        <Button
          onClick={scheduleTripHandler ? scheduleTripHandler : null}
          colorScheme="blue"
          isDisabled={!loggedIn}
          width={'100%'}
        >
          Schedule Trip
        </Button>
        <Button width={'100%'} onClick={backClickHandler}>
          Back
        </Button>
      </Stack>
    );
  }
);
