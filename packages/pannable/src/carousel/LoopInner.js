import React, { useMemo, useReducer, useRef } from 'react';
import ListContent from '../pad/ListContent';
import { reducer, initialLoopState } from './loopReducer';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';

function LoopInner(props) {
  const { pad, onAdjust, direction, children } = props;
  const [state, dispatch] = useReducer(reducer, initialLoopState);
  const responseRef = useRef({});

  responseRef.current.onAdjust = onAdjust;

  useMemo(() => {
    dispatch({ type: 'syncProps', props: { pad, direction } });
  }, [pad, direction]);

  useIsomorphicLayoutEffect(() => {
    if (state.scrollTo) {
      responseRef.current.onAdjust(state.scrollTo);
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
}

export default LoopInner;
