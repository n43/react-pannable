import reducer, {
  initialCarouselState,
  CarouselScrollTo,
  CarouselEvent,
} from './carouselReducer';
import { PadState, PadScrollTo } from '../pad/padReducer';
import { XY } from '../interfaces';
import { useIsomorphicLayoutEffect, usePrevious } from '../utils/hooks';
import React, { useMemo, useEffect, useReducer, useRef } from 'react';

export interface CarouselInnerProps {
  pad: PadState;
  direction: XY;
  loop: boolean;
  autoplayEnabled: boolean;
  autoplayInterval: number;
  itemCount: number;
  onActiveIndexChange: (evt: CarouselEvent) => void;
  onAdjust: (scrollTo: PadScrollTo) => void;
  scrollToIndex: CarouselScrollTo | null;
}

const CarouselInner: React.FC<CarouselInnerProps> = React.memo(props => {
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
  const prevState = usePrevious(state);
  const delegate = { onActiveIndexChange, onAdjust };
  const delegateRef = useRef(delegate);
  delegateRef.current = delegate;

  useMemo(() => {
    dispatch({
      type: 'syncProps',
      payload: { props: { pad, direction, loop, itemCount } },
    });
  }, [pad, direction, loop, itemCount]);

  useIsomorphicLayoutEffect(() => {
    if (prevState.activeIndex !== state.activeIndex) {
      const evt: CarouselEvent = {
        activeIndex: state.activeIndex,
        itemCount: state.itemCount,
      };

      delegateRef.current.onActiveIndexChange(evt);
    }
  }, [state]);

  useIsomorphicLayoutEffect(() => {
    if (state.scrollTo) {
      delegateRef.current.onAdjust(state.scrollTo);
    }
  }, [state.scrollTo]);

  useEffect(() => {
    if (scrollToIndex) {
      dispatch({ type: 'scrollToIndex', payload: { value: scrollToIndex } });
    }
  }, [scrollToIndex]);

  useEffect(() => {
    if (!autoplayEnabled || state.pad.drag || state.pad.deceleration) {
      return;
    }

    const timer = setTimeout(() => {
      dispatch({ type: 'next', payload: { animated: true } });
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
});

export default CarouselInner;
