import reducer, {
  initialCarouselState,
  CarouselEvent,
  CarouselState,
  CarouselMethods,
} from './carouselReducer';
import { PadState, PadMethods } from '../pad/padReducer';
import { XY } from '../interfaces';
import { useIsomorphicLayoutEffect } from '../utils/hooks';
import React, { useReducer, useRef } from 'react';

export interface CarouselInnerProps {
  pad: PadState;
  padMethods: PadMethods;
  direction: XY;
  loop: boolean;
  autoplayEnabled: boolean;
  autoplayInterval: number;
  itemCount: number;
  onActiveIndexChange?: (evt: CarouselEvent) => void;
  render: (state: CarouselState, methods: CarouselMethods) => React.ReactNode;
}

export const CarouselInner = React.memo<CarouselInnerProps>((props) => {
  const {
    pad,
    padMethods,
    direction,
    loop,
    autoplayEnabled,
    autoplayInterval,
    itemCount,
    onActiveIndexChange,
    render,
  } = props;
  const [state, dispatch] = useReducer(reducer, initialCarouselState);
  const prevStateRef = useRef(state);
  const delegate = { onActiveIndexChange, scrollTo: padMethods.scrollTo };
  const delegateRef = useRef(delegate);
  delegateRef.current = delegate;

  const methodsRef = useRef<CarouselMethods>({
    scrollToIndex(params) {
      dispatch({ type: 'scrollToIndex', payload: params });
    },
    play(playing) {
      dispatch({ type: 'play', payload: playing });
    },
  });

  useIsomorphicLayoutEffect(() => {
    dispatch({
      type: 'setState',
      payload: { pad, direction, loop, itemCount },
    });
  }, [pad, direction, loop, itemCount]);

  useIsomorphicLayoutEffect(() => {
    const prevState = prevStateRef.current;
    prevStateRef.current = state;

    if (prevState.activeIndex !== state.activeIndex) {
      const evt: CarouselEvent = {
        activeIndex: state.activeIndex,
        itemCount: state.itemCount,
      };

      if (delegateRef.current.onActiveIndexChange) {
        delegateRef.current.onActiveIndexChange(evt);
      }
    }
  }, [state]);

  useIsomorphicLayoutEffect(() => {
    if (state.scrollTo) {
      delegateRef.current.scrollTo(state.scrollTo);
    }
  }, [state.scrollTo]);

  useIsomorphicLayoutEffect(() => {
    if (!state.playing) {
      return;
    }

    const timer = setInterval(() => {
      dispatch({ type: 'next', payload: { animated: true } });
    }, autoplayInterval);

    return () => {
      clearInterval(timer);
    };
  }, [state.playing, autoplayInterval]);

  useIsomorphicLayoutEffect(() => {
    methodsRef.current.play(autoplayEnabled && !state.pad.drag);
  }, [autoplayEnabled, state.pad.drag]);

  return <>{render(state, methodsRef.current)}</>;
});

export default CarouselInner;
