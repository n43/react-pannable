import reducer, {
  initialInfiniteState,
  InfiniteScrollTo,
} from './infiniteReducer';
import { Rect } from '../interfaces';
import { PadState, PadScrollTo } from '../pad/padReducer';
import { useIsomorphicLayoutEffect, usePrevious } from '../utils/hooks';
import React, { useMemo, useEffect, useReducer, useRef } from 'react';

export interface InfiniteInnerProps {
  pad: PadState;
  calculateRectForIndex: (index: number) => Rect;
  onAdjust: (scrollTo: PadScrollTo) => void;
  scrollToIndex: InfiniteScrollTo | null;
}

const InfiniteInner: React.FC<InfiniteInnerProps> = React.memo(props => {
  const {
    pad,
    scrollToIndex,
    calculateRectForIndex,
    onAdjust,
    children,
  } = props;
  const [state, dispatch] = useReducer(reducer, initialInfiniteState);
  const prevState = usePrevious(state);
  const delegate = { onAdjust, calculateRectForIndex };
  const delegateRef = useRef(delegate);
  delegateRef.current = delegate;

  useMemo(() => {
    dispatch({ type: 'syncProps', payload: { props: { pad } } });
  }, [pad]);

  useIsomorphicLayoutEffect(() => {
    if (state.scroll) {
      if (prevState.pad.contentSize !== state.pad.contentSize) {
        const rect = delegateRef.current.calculateRectForIndex(
          state.scroll.index
        );

        dispatch({ type: 'scrollRecalculate', payload: { rect } });
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
      delegateRef.current.onAdjust(state.scrollTo);
    }
  }, [state.scrollTo]);

  useEffect(() => {
    if (scrollToIndex) {
      const rect = delegateRef.current.calculateRectForIndex(
        scrollToIndex.index
      );

      dispatch({
        type: 'scrollToIndex',
        payload: { value: scrollToIndex, rect },
      });
    }
  }, [scrollToIndex]);

  return <>{typeof children === 'function' ? children(state) : children}</>;
});

export default InfiniteInner;
