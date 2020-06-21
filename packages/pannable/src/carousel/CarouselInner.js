import React, { useMemo, useEffect, useReducer, useRef } from 'react';
import { reducer, initialCarouselState } from './carouselReducer';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
import { usePrevRef } from '../hooks/usePrevRef';

function CarouselInner(props) {
  const {
    pad,
    direction,
    loop,
    autoplayEnabled,
    autoplayInterval,
    itemCount,
    onActiveIndexChange,
    onAdjust,
    scrollToIndex,
    children,
  } = props;
  const [state, dispatch] = useReducer(reducer, initialCarouselState);
  const prevStateRef = usePrevRef(state);
  const prevState = prevStateRef.current;
  const responseRef = useRef({});

  responseRef.current.onActiveIndexChange = onActiveIndexChange;
  responseRef.current.onAdjust = onAdjust;

  useMemo(() => {
    dispatch({
      type: 'syncProps',
      props: {
        pad,
        direction,
        loop,
        itemCount,
      },
    });
  }, [pad, direction, loop, itemCount]);

  useIsomorphicLayoutEffect(() => {
    if (prevState.activeIndex !== state.activeIndex) {
      const output = {
        activeIndex: state.activeIndex,
        itemCount: state.itemCount,
      };

      responseRef.current.onActiveIndexChange(output);
    }
  }, [state]);

  useIsomorphicLayoutEffect(() => {
    if (state.scrollTo) {
      responseRef.current.onAdjust(state.scrollTo);
    }
  }, [state.scrollTo]);

  useEffect(() => {
    if (scrollToIndex) {
      dispatch({ type: 'scrollToIndex', value: scrollToIndex });
    }
  }, [scrollToIndex]);

  useEffect(() => {
    if (!autoplayEnabled || state.pad.drag || state.pad.deceleration) {
      return;
    }

    const timer = setTimeout(() => {
      dispatch({ type: 'next', animated: true });
    }, autoplayInterval);

    return () => {
      clearTimeout(timer);
    };
  }, [
    autoplayEnabled,
    autoplayInterval,
    state.pad.drag,
    state.pad.deceleration,
  ]);

  return <>{typeof children === 'function' ? children(state) : children}</>;
}

export default CarouselInner;
