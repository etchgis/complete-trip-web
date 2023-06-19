import { Box } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';

export const DependentsDetail = () => {
  const params = useParams();
  console.log(params);
  return <Box>Detail</Box>;
};
