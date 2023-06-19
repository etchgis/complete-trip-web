import { DependentsList } from './DependentsList';
import { DependentsTrips } from './DependentsTrips';
import { Grid } from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import { toJS } from 'mobx';
import { useEffect } from 'react';
import { useStore } from '../../context/RootStore';

export const Dependents = observer(() => {
  const { dependents, hydrate } = useStore().caregivers;
  const { setIsLoading } = useStore().uiStore;
  const { dependentTrips: trips, hydrateDependentTrips } = useStore().schedule;

  console.log(toJS(trips));

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
      gridTemplateRows={'repeat(2, 50%)'}
    >
      <DependentsTrips dependents={dependents} trips={trips} />
      <DependentsList dependents={dependents} trips={trips} />
    </Grid>
  );
});
