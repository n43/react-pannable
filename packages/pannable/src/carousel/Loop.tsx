import LoopInner from './LoopInner';
import { XY } from '../interfaces';
import { PadState, PadMethods } from '../pad/padReducer';
import Pad, { defaultPadProps, PadProps } from '../pad/Pad';
import React from 'react';

export interface LoopProps extends PadProps {
  direction: XY;
}

const defaultLoopProps: LoopProps = {
  direction: 'x',
  ...defaultPadProps,
  directionalLockEnabled: true,
};

const Loop: React.FC<
  LoopProps & Omit<React.ComponentProps<'div'>, 'onScroll'>
> = React.memo((props) => {
  const { direction, children, ...padProps } = props as Required<LoopProps> &
    Omit<React.ComponentProps<'div'>, 'onScroll'>;

  if (direction === 'x') {
    padProps.boundX = -1;
  } else {
    padProps.boundY = -1;
  }

  return (
    <Pad {...padProps}>
      {(pad: PadState, methods: PadMethods) => (
        <LoopInner
          pad={pad}
          onAdjust={methods._scrollTo}
          direction={direction}
          children={children}
        />
      )}
    </Pad>
  );
});

Loop.defaultProps = defaultLoopProps;
export default Loop;
