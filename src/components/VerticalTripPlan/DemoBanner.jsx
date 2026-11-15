import { Box } from '@chakra-ui/react';
import useTranslation from '../../models/useTranslation';
import { isWalkUpDemoActive } from '../../models/kiosk-walkup';

// Shown across the top of the summon screens on a demo build, so nobody thinks
// a real ride was booked. It renders nothing on any other build or page.
export const DEMO_BANNER_HEIGHT = 48;

const DemoBanner = () => {
  const { t } = useTranslation();
  if (!isWalkUpDemoActive()) return null;
  return (
    <Box
      role="status"
      position="fixed"
      top={0}
      left={0}
      right={0}
      h={`${DEMO_BANNER_HEIGHT}px`}
      zIndex={20000}
      bg="black"
      color="yellow.300"
      fontSize="24px"
      fontWeight="bold"
      textAlign="center"
      lineHeight={`${DEMO_BANNER_HEIGHT}px`}
      borderBottom="4px solid"
      borderColor="yellow.300"
    >
      {t('walkUp.demoBanner')}
    </Box>
  );
};

export default DemoBanner;
