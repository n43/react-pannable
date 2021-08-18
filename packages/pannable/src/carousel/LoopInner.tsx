import reducer, { initialLoopState, LoopState } from './loopReducer';
import { PadState, PadMethods } from '../pad/padReducer';
import ListContent from '../pad/ListContent';
import { XY } from '../interfaces';
import { useIsomorphicLayoutEffect } from '../utils/hooks';
import React, { useReducer, useRef } from 'react';

export interface LoopInnerProps {
  pad: PadState;
  padMethods: PadMethods;
  direction: XY;
  render: (state: LoopState) => React.ReactNode;
}

export const LoopInner = React.memo<LoopInnerProps>((props) => {
  const { pad, padMethods, direction, render } = props;
  const [state, dispatch] = useReducer(reducer, initialLoopState);
  const delegate = { scrollTo: padMethods.scrollTo };
  const delegateRef = useRef(delegate);
  delegateRef.current = delegate;

  useIsomorphicLayoutEffect(() => {
    dispatch({ type: 'setState', payload: { pad, direction } });
  }, [pad, direction]);

  useIsomorphicLayoutEffect(() => {
    if (state.scrollTo) {
      delegateRef.current.scrollTo(state.scrollTo);
    }
  }, [state.scrollTo]);

  return (
    <ListContent
      direction={direction}
      width={state.pad.size.width}
      height={state.pad.size.height}
      itemCount={state.loopCount}
      renderItem={({ Item, itemIndex }) => {
        return (
          <Item key={itemIndex + state.loopOffset} hash="Loop" forceRender>
            {render(state)}
          </Item>
        );
      }}
    />
  );
});

export default LoopInner;
