import reducer, {
  initialInfiniteState,
  InfiniteState,
  InfiniteLayout,
  InfiniteMethods,
} from './infiniteReducer';
import { PadMethods, PadState } from '../pad/padReducer';
import { useIsomorphicLayoutEffect } from '../utils/hooks';
import React, { useMemo, useReducer, useRef } from 'react';

export interface InfiniteInnerProps {
  pad: PadState;
  padMethods: PadMethods;
  layout: InfiniteLayout;
  render: (state: InfiniteState, methods: InfiniteMethods) => React.ReactNode;
}

export const InfiniteInner = React.memo<InfiniteInnerProps>((props) => {
  const { pad, padMethods, layout, render } = props;
  const [state, dispatch] = useReducer(reducer, initialInfiniteState);
  const prevStateRef = useRef(state);
  const layoutRef = useRef(layout);
  const delegate = { scrollTo: padMethods.scrollTo };
  const delegateRef = useRef(delegate);
  delegateRef.current = delegate;

  const methodsRef = useRef<InfiniteMethods>({
    scrollToIndex(params) {
      dispatch({
        type: 'scrollToIndex',
        payload: { params, layout: layoutRef.current },
      });
    },
  });

  useMemo(() => {
    dispatch({ type: 'setState', payload: { pad } });
  }, [pad]);

  useIsomorphicLayoutEffect(() => {
    const prevState = prevStateRef.current;
    prevStateRef.current = state;

    if (state.scroll) {
      if (prevState.pad.contentSize !== state.pad.contentSize) {
        dispatch({
          type: 'scrollRecalculate',
          payload: { layout: layoutRef.current },
        });
      }
      if (prevState.pad.deceleration !== state.pad.deceleration) {
        if (!state.pad.deceleration) {
          dispatch({ type: 'scrollEnd' });
        }
      }
    }
  }, [state]);

  useIsomorphicLayoutEffect(() => {
    if (state.scrollTo) {
      delegateRef.current.scrollTo(state.scrollTo);
    }
  }, [state.scrollTo]);

  return <>{render(state, methodsRef.current)}</>;
});

export default InfiniteInner;
