import { useMemo, useRef, useReducer } from 'react';
import { reducer, initialState } from './padReducer';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
import { usePrevRef } from '../hooks/usePrevRef';
import {
  requestAnimationFrame,
  cancelAnimationFrame,
} from '../utils/animationFrame';

export default function PadInner(props) {
  const {
    enabled,
    pannable,
    size,
    contentSize,
    pagingEnabled,
    directionalLockEnabled,
    alwaysBounce,
    onScroll,
    onDragStart,
    onDragEnd,
    onDecelerationStart,
    onDecelerationEnd,
    scrollTo,
    scrollToRect,
    children,
  } = props;
  const prevPannableRef = usePrevRef(pannable);
  const prevPannable = prevPannableRef.current;
  const [state, dispatch] = useReducer(reducer, initialState);
  const prevStateRef = usePrevRef(state);
  const prevState = prevStateRef.current;
  const options = useMemo(
    () => ({
      size,
      contentSize,
      pagingEnabled,
      alwaysBounce,
    }),
    [size, contentSize, pagingEnabled, alwaysBounce]
  );

  const innerRef = useRef({});
  innerRef.current.options = options;

  useIsomorphicLayoutEffect(() => {
    if (prevPannable.translation !== pannable.translation) {
      const now = new Date().getTime();

      if (pannable.translation) {
        if (prevPannable.translation) {
          dispatch({ type: 'dragMove', pannable, options, now });
        } else {
          dispatch({
            type: 'dragStart',
            pannable,
            options,
            now,
            directionalLockEnabled,
          });
        }
      } else {
        if (enabled) {
          dispatch({ type: 'dragEnd', pannable, options, now });
        } else {
          dispatch({ type: 'dragCancel', pannable, options, now });
        }
      }
    }

    const input = {
      size,
      contentSize,
      contentOffset: state.contentOffset,
      contentVelocity: state.contentVelocity,
      dragging: !!state.drag,
      decelerating: !!state.deceleration,
    };

    if (prevState.contentOffset !== state.contentOffset) {
      onScroll(input);
    }
    if (prevState.drag !== state.drag) {
      if (!prevState.drag) {
        onDragStart(input);
      } else if (!state.drag) {
        onDragEnd(input);
      }
    }
    if (prevState.deceleration !== state.deceleration) {
      if (!prevState.deceleration) {
        onDecelerationStart(input);
      } else if (!state.deceleration) {
        onDecelerationEnd(input);
      }
    }
  });

  useIsomorphicLayoutEffect(() => {
    if (!state.deceleration) {
      return;
    }

    const timer = requestAnimationFrame(() => {
      dispatch({
        type: 'decelerate',
        options: innerRef.current.options,
        now: new Date().getTime(),
      });
    });

    return () => {
      cancelAnimationFrame(timer);
    };
  }, [state]);

  useMemo(() => {
    dispatch({ type: 'validate', options, now: new Date().getTime() });
  }, [options]);

  useMemo(() => {
    if (scrollTo) {
      dispatch({
        ...scrollTo,
        type: 'scrollTo',
        options: innerRef.current.options,
        now: new Date().getTime(),
      });
    }
  }, [scrollTo]);

  useMemo(() => {
    if (scrollToRect) {
      dispatch({
        ...scrollToRect,
        type: 'scrollToRect',
        options: innerRef.current.options,
        now: new Date().getTime(),
      });
    }
  }, [scrollToRect]);

  return children(state);
}
