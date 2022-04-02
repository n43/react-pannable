import reducer, {
  initialInfiniteState,
  InfiniteState,
  InfiniteLayout,
  InfiniteMethods,
} from './infiniteReducer';
import { PadMethods, PadState } from '../pad/padReducer';
import { XY } from '../interfaces';
import { useIsomorphicLayoutEffect } from '../utils/hooks';
import React, { useMemo, useReducer, useRef } from 'react';

export interface InfiniteInnerProps {
  direction?: XY;
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
  const delegateRef = useRef(padMethods);
  delegateRef.current = padMethods;

  const methodsRef = useRef<InfiniteMethods>({
    scrollTo(params) {
      dispatch({
        type: 'scrollTo',
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
      } else {
        if (!state.pad.deceleration) {
          if (!state.scroll.animated || prevState.pad.deceleration) {
            setTimeout(() => {
              dispatch({ type: 'scrollEnd' });
            }, 0);
          }
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
