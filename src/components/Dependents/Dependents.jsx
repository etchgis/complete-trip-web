import { DependentsList } from './DependentsList';
import { DependentsTripsTable } from './DependentsTripsTable';
import { Grid } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { useEffect } from 'react';
import { useStore } from '../../context/RootStore';

export const Dependents = observer(() => {
  const { dependents, hydrate } = useStore().caregivers;
  const { setIsLoading } = useStore().uiStore;
  const { dependentTrips: trips, hydrateDependentTrips } = useStore().schedule;
  const _trips = toJS(trips);
  console.log({ _trips });

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
      <DependentsTripsTable dependents={dependents} trips={_trips} limit={5} />
      <DependentsList dependents={dependents} trips={_trips} limit={null} />
    </Grid>
  );
});
