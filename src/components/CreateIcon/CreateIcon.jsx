import { Icon } from '@chakra-ui/react';

export const CreateIcon = props => {
  return (
    <Icon
      viewBox={props?.viewBox || '0 0 512 512'}
      mr={2}
      boxSize={'5'}
      display="inline-flex"
    >
      <path
        fill={'currentColor'}
        d={
          props?.path ||
          'M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0'
        }
      />
    </Icon>
  );
};
