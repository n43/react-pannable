import React from 'react';
import LoopInner from './LoopInner';
import Pad from '../pad/Pad';

const defaultLoopProps = {
  direction: 'x',
  ...Pad.defaultProps,
  directionalLockEnabled: true,
};

function Loop(props) {
  const { direction, children, ...padProps } = props;

  if (direction === 'x') {
    padProps.isBoundlessX = true;
    padProps.alwaysBounceY = false;
  } else {
    padProps.isBoundlessY = true;
    padProps.alwaysBounceX = false;
  }

  return (
    <Pad {...padProps}>
      {(pad, methods) => {
        const loopProps = {
          pad,
          onAdjust: methods._scrollTo,
          direction,
        };

        return (
          <LoopInner {...loopProps}>
            {state => {
              return typeof children === 'function'
                ? children(state, methods)
                : children;
            }}
          </LoopInner>
        );
      }}
    </Pad>
  );
}

Loop.defaultProps = defaultLoopProps;
export default Loop;
