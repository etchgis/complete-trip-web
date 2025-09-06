import { DependentsList } from './DependentsList';
import { DependentsTripsTable } from './DependentsTripsTable';
import { Grid, Flex, Spinner, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useStore } from '../../context/RootStore';
import useTranslation from '../../models/useTranslation';

export const Dependents = () => {
  const { hydrate } = useStore().caregivers;
  const { hydrateDependentTrips } = useStore().schedule;
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  //NOTE hydrate the caregivers and trips on each page load
  useEffect(() => {
    //GET DEPENDENTS
    (async () => {
      try {
        setIsLoading(true);
        await hydrate(); //UPDATE DEPENDENTS
        await hydrateDependentTrips(); //GET ALL DEPENDENT TRIPS
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    })();
    //eslint-disable-next-line
  }, []);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <Spinner size="lg" color="blue.500" mr={3} />
        <Text>{t('global.loading')}</Text>
      </Flex>
    );
  }

  return (
    <Grid
      spacing={10}
      minH="calc(100% - 80px)"
      gridTemplateRows={'repeat(auto-fill, minmax(50%, 1fr))'}
      gridGap={{ base: '40px', md: '20px' }}
    >
      <DependentsTripsTable limit={3} />
      <DependentsList />
    </Grid>
  );
};
