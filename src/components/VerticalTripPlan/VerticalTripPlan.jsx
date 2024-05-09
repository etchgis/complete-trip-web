import { Box, Button, Center, Flex, FormControl, FormLabel, IconButton, PinInput, PinInputField, Stack, Text, VStack, useColorMode } from '@chakra-ui/react';

import { TripPlanMap } from './TripPlanMap';
import { TripPlanSchedule } from './TripPlanSchedule';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { useStore } from '../../context/RootStore';
import useTranslation from '../../models/useTranslation';
import { useState } from 'react';
import { CloseIcon } from '@chakra-ui/icons';

export const VerticalTripPlan = observer(
  ({
    tripPlan,
    tripRequest,
    rider,
    scheduleTripHandler,
    backClickHandler,
    cancelClickHandler,
    summonShuttleHandler,
  }) => {
    const { colorMode } = useColorMode();
    const { trip } = useStore();
    const { ux } = useStore().uiStore;
    const { t } = useTranslation();

    const [showSummon, setShowSummon] = useState(false);

    const handleSummonShuttle = () => {
      setShowSummon(true);
    }

    return (
      <>
        {ux === 'kiosk' && showSummon &&
          <Flex
            background={'white'}
            position={'absolute'}
            zIndex={3}
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            h="400px"
            w="700px"
            alignItems={'center'}
            justifyContent={'center'}
            borderRadius={'md'}
            boxShadow={'md'}
            data-testid="trip-plan-schedule-qr"
          >
            <IconButton
              onClick={() => setShowSummon(false)}
              aria-label={t('global.close')}
              icon={<CloseIcon />}
              pos={'absolute'}
              top={4}
              right={4}
              variant={'ghost'}
            />
            <Box
              as='form'
              onSubmit={(e) => { }}
            >
              <VStack>
                <FormControl>
                  <FormLabel textAlign={'center'}>PIN</FormLabel>
                  <Center w={'100%'}>
                    <PinInput
                      otp
                      onChange={(e) => {
                        console.log('e', e);
                      }}
                      name={'pin'}
                      size="lg"
                    >
                      <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                      <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                      <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                      <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                    </PinInput>
                  </Center>
                </FormControl>
                <FormControl>
                  <FormLabel textAlign={'center'}>Phone</FormLabel>
                  <Center w={'100%'}>
                    <PinInput
                      otp
                      onChange={(e) => {
                        console.log('e', e);
                      }}
                      name={'pin'}
                      size="lg"
                    >
                      <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                      <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                      <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                      <Text>-</Text>
                      <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                      <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                      <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                      <Text>-</Text>
                      <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                      <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                      <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                      <PinInputField mx={2} onFocus={(e) => { e.target.select() }} />
                    </PinInput>
                  </Center>
                </FormControl>
                <Button
                  variant={'brand'}
                  width={'100%'}
                >
                  {t('tripWizard.summonShuttle')}
                </Button>
              </VStack>
            </Box>
          </Flex>
        }
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
              summonShuttleHandler={handleSummonShuttle}
            />
          </Flex>

          <TripPlanMap tripPlan={tripPlan} flex={1} />
        </Flex>
      </>
    );
  }
);

const TripPlanScheduleButtons = observer(
  ({ scheduleTripHandler, backClickHandler, cancelClickHandler, summonShuttleHandler }) => {
    const { loggedIn } = useStore().authentication;
    const { ux } = useStore().uiStore;
    const { trip } = useStore();
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
        {summonShuttleHandler && trip.isShuttle && ux === 'kiosk' && (
          <Button
            onClick={summonShuttleHandler ? summonShuttleHandler : null}
            variant={'brand'}
            width={'100%'}
          >
            {t('tripWizard.summonShuttle')}
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
