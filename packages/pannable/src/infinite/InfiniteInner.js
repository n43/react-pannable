import React, { useMemo, useEffect, useReducer } from 'react';
import { reducer, initialInfiniteState } from './infiniteReducer';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
import { usePrevRef } from '../hooks/usePrevRef';

function InfiniteInner(props) {
  const { pad, scrollToIndex, listRef, onAdjust, children } = props;
  const [state, dispatch] = useReducer(reducer, initialInfiniteState);
  const prevStateRef = usePrevRef(state);
  const prevState = prevStateRef.current;

  useMemo(() => {
    dispatch({
      type: 'syncProps',
      props: { pad },
    });
  }, [pad]);

  useIsomorphicLayoutEffect(() => {
    if (state.scroll) {
      if (prevState.pad.contentSize !== state.pad.contentSize) {
        dispatch({ type: 'scrollRecalculate', list: listRef.current });
      }
      if (prevState.pad.deceleration !== state.pad.deceleration) {
        if (!state.pad.deceleration) {
          dispatch({ type: 'scrollEnd' });
        }
      }
    }
  });

  useIsomorphicLayoutEffect(() => {
    if (state.scrollTo) {
      onAdjust(state.scrollTo);
    }
  }, [state.scrollTo, onAdjust]);

  useEffect(() => {
    if (scrollToIndex) {
      dispatch({
        type: 'scrollToIndex',
        value: scrollToIndex,
        list: listRef.current,
      });
    }
  }, [scrollToIndex, listRef]);

  return <>{typeof children === 'function' ? children(state) : children}</>;
}

export default InfiniteInner;
