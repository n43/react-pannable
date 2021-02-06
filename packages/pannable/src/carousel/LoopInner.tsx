import reducer, { initialLoopState } from './loopReducer';
import { PadState, PadScrollTo } from '../pad/padReducer';
import ListContent from '../pad/ListContent';
import { XY } from '../interfaces';
import { useIsomorphicLayoutEffect } from '../utils/hooks';
import React, { useMemo, useReducer, useRef } from 'react';

export interface LoopInnerProps {
  pad: PadState;
  direction: XY;
  onAdjust: (scrollTo: PadScrollTo) => void;
}

const LoopInner: React.FC<LoopInnerProps> = React.memo(props => {
  const { pad, onAdjust, direction, children } = props;
  const [state, dispatch] = useReducer(reducer, initialLoopState);
  const delegate = { onAdjust };
  const delegateRef = useRef(delegate);
  delegateRef.current = delegate;

  useMemo(() => {
    dispatch({ type: 'syncProps', payload: { props: { pad, direction } } });
  }, [pad, direction]);

  useIsomorphicLayoutEffect(() => {
    if (state.scrollTo) {
      delegateRef.current.onAdjust(state.scrollTo);
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
            {typeof children === 'function' ? children(state) : children}
          </Item>
        );
      }}
    />
  );
});

export default LoopInner;
