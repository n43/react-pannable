import React, { useMemo, useReducer } from 'react';
import ListContent from '../pad/ListContent';
import { reducer, initialLoopState } from './loopReducer';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';

function LoopInner(props) {
  const { pad, onAdjust, direction, children } = props;
  const [state, dispatch] = useReducer(reducer, initialLoopState);

  useMemo(() => {
    dispatch({ type: 'syncProps', props: { pad, direction } });
  }, [pad, direction]);

  useIsomorphicLayoutEffect(() => {
    if (state.scrollTo) {
      onAdjust(state.scrollTo);
    }
  }, [state.scrollTo, onAdjust]);

  const element = typeof children === 'function' ? children(state) : children;

  return (
    <ListContent
      direction={direction}
      width={pad.size.width}
      height={pad.size.height}
      itemCount={state.loopCount}
      renderItem={({ Item, itemIndex }) => {
        return (
          <Item key={itemIndex + state.loopOffset} hash="Loop">
            {element}
          </Item>
        );
      }}
    />
  );
}

export default LoopInner;
