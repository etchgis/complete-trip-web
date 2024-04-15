import { Box, Button, Flex, Stack, useColorMode } from '@chakra-ui/react';

import { TripPlanMap } from './TripPlanMap';
import { TripPlanSchedule } from './TripPlanSchedule';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { useStore } from '../../context/RootStore';
import useTranslation from '../../models/useTranslation';

export const VerticalTripPlan = observer(
  ({
    tripPlan,
    tripRequest,
    rider,
    scheduleTripHandler,
    backClickHandler,
    cancelClickHandler,
  }) => {
    const { colorMode } = useColorMode();
    console.log(toJS(tripPlan));
    return (
      <Flex
        id="vertical-trip-plan"
        flex={1}
        width={'100vw'}
        borderTop="solid thin lightgray"
        borderBottom="solid thin lightgray"
        borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
        height={'100%'}
        overflow={'hidden'}
      >
        <Flex
          flexDir={'column'}
          borderRight="solid thin lightgray"
          borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
          w={{ base: '100%', md: '380px' }}
          id="vertical-trip-plan-sidebar"
        >
          <Box
            display="flex"
            flexDir={'column'}
            overflow={'auto'}
            flex={1}
            py={2}
            id="vertical-trip-plan-schedule-container"
            tabIndex={0}
          >
            <TripPlanSchedule
              tripPlan={tripPlan}
              tripRequest={tripRequest}
              rider={rider}
            />
          </Box>
          <TripPlanScheduleButtons
            scheduleTripHandler={scheduleTripHandler}
            backClickHandler={backClickHandler}
            cancelClickHandler={cancelClickHandler}
          />
        </Flex>

        <TripPlanMap tripPlan={tripPlan} flex={1} />
      </Flex>
    );
  }
);

const TripPlanScheduleButtons = observer(
  ({ scheduleTripHandler, backClickHandler, cancelClickHandler }) => {
    const { loggedIn } = useStore().authentication;
    const { ux } = useStore().uiStore;
    const { t } = useTranslation();
    return (
      <Stack
        spacing={4}
        alignItems="center"
        py={4}
        px={2}
        id="trip-plan-schedule-buttons"
      >
        {scheduleTripHandler && ux === 'webapp' && (
          <Button
            onClick={scheduleTripHandler ? scheduleTripHandler : null}
            variant={'brand'}
            isDisabled={!loggedIn}
            width={'100%'}
          >
            {t('tripWizard.scheduleTrip')}
          </Button>
        )}
        {cancelClickHandler && (
          <Button
            width={'100%'}
            variant={'solid'}
            colorScheme="red"
            onClick={cancelClickHandler}
          >
            {t('global.cancel')}
          </Button>
        )}
        <Button width={'100%'} onClick={backClickHandler}>
          {scheduleTripHandler ? t('global.prev') : t('global.close')}
        </Button>
      </Stack>
    );
  }
);
