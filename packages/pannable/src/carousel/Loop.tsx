import { LoopState } from './loopReducer';
import LoopInner from './LoopInner';
import { XY } from '../interfaces';
import { PadState, PadMethods } from '../pad/padReducer';
import Pad from '../pad/Pad';
import React from 'react';

export interface LoopProps {
  direction: XY;
  render?: (state: LoopState) => React.ReactNode;
}

export const Loop = React.memo<
  Omit<React.ComponentProps<typeof Pad>, 'render'> & LoopProps
>((props) => {
  const { direction = 'x', render, children, ...padProps } = props;
  const { directionalLockEnabled = true } = padProps;

  padProps.directionalLockEnabled = directionalLockEnabled;

  if (direction === 'x') {
    padProps.boundX = padProps.boundX ?? -1;
  } else {
    padProps.boundY = padProps.boundY ?? -1;
  }

  return (
    <Pad
      {...padProps}
      render={(pad: PadState, methods: PadMethods) => (
        <LoopInner
          pad={pad}
          padMethods={methods}
          direction={direction}
          render={(state) => {
            return render ? render(state) : children;
          }}
        />
      )}
    />
  );
});

export default Loop;
