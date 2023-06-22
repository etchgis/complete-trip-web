import { DependentsList } from './DependentsList';
import { DependentsTripsTable } from './DependentsTripsTable';
import { Grid } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useStore } from '../../context/RootStore';

export const Dependents = () => {
  const { hydrate } = useStore().caregivers;
  const { setIsLoading } = useStore().uiStore;
  const { hydrateDependentTrips } = useStore().schedule;

  //NOTE hydrate the trips in this component so we dont have to in the child components
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

  return (
    <Grid
      spacing={10}
      minH="calc(100% - 80px)"
      gridTemplateRows={'repeat(auto-fill, minmax(50%, 1fr))'}
      gridGap={{ base: '40px', md: '20px' }}
    >
      <DependentsTripsTable limit={5} />
      <DependentsList limit={null} />
    </Grid>
  );
};
