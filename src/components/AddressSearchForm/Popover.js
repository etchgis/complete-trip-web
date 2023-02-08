import * as React from 'react';

import { DismissButton, Overlay, usePopover } from '@react-aria/overlays';

import { Box } from '@chakra-ui/react';

export function Popover(props) {
  let ref = React.useRef(null);
  let { popoverRef = ref, state, children, isNonModal } = props;

  let { popoverProps, underlayProps } = usePopover(
    {
      ...props,
      popoverRef,
    },
    state
  );

  return (
    <Overlay>
      {!isNonModal && (
        <div {...underlayProps} style={{ position: 'fixed', inset: 0 }} />
      )}
      <Box
        {...popoverProps}
        ref={popoverRef}
        background="white"
        border="1px solid lightgray"
        borderRadius="md"
        zIndex="10"
        width="416px"
        maxW="calc(100vw - 94px)"
        boxShadow="lg"
      >
        {!isNonModal && <DismissButton onDismiss={state.close} />}
        {children}
        <DismissButton onDismiss={state.close} />
      </Box>
    </Overlay>
  );
}
