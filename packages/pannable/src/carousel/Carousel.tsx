import {
  CarouselScrollTo,
  CarouselState,
  CarouselEvent,
  CarouselMethods,
} from './carouselReducer';
import CarouselInner from './CarouselInner';
import GridContent, { GridLayoutAttrs } from '../pad/GridContent';
import Loop from './Loop';
import Pad from '../pad/Pad';
import { XY } from '../interfaces';
import { useIsomorphicLayoutEffect } from '../utils/hooks';
import React, { useRef, useCallback } from 'react';

export interface CarouselProps {
  itemCount: number;
  renderItem: (attrs: GridLayoutAttrs) => React.ReactNode;
  direction?: XY;
  loop?: boolean;
  autoplayEnabled?: boolean;
  autoplayInterval?: number;
  onActiveIndexChange?: (evt: CarouselEvent) => void;
  scrollToIndex?: CarouselScrollTo | null;
  render?: (state: CarouselState, methods: CarouselMethods) => React.ReactNode;
}

export const Carousel = React.memo<
  Omit<React.ComponentProps<typeof Pad>, 'render'> & CarouselProps
>((props) => {
  const {
    itemCount,
    renderItem,
    direction = 'x',
    loop = true,
    autoplayEnabled = true,
    autoplayInterval = 5000,
    onActiveIndexChange,
    scrollToIndex,
    render,
    children,
    ...padProps
  } = props;
  const {
    width,
    height,
    pagingEnabled = true,
    directionalLockEnabled = true,
    renderOverlay,
    onMouseEnter,
    onMouseLeave,
  } = padProps;
  const methodsRef = useRef<CarouselMethods>();
  const delegate = { onMouseEnter, onMouseLeave };
  const delegateRef = useRef(delegate);
  delegateRef.current = delegate;

  const padOnMouseEnter = useCallback((evt) => {
    const methods = methodsRef.current;

    if (methods) {
      methods.play(false);
    }

    if (delegateRef.current.onMouseEnter) {
      delegateRef.current.onMouseEnter(evt);
    }
  }, []);
  const padOnMouseLeave = useCallback((evt) => {
    const methods = methodsRef.current;

    if (methods) {
      methods.play(true);
    }

    if (delegateRef.current.onMouseLeave) {
      delegateRef.current.onMouseLeave(evt);
    }
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (scrollToIndex) {
      const methods = methodsRef.current;

      if (methods) {
        methods.scrollToIndex(scrollToIndex);
      }
    }
  }, [scrollToIndex]);

  padProps.pagingEnabled = pagingEnabled;
  padProps.directionalLockEnabled = directionalLockEnabled;

  if (autoplayEnabled) {
    padProps.onMouseEnter = padOnMouseEnter;
    padProps.onMouseLeave = padOnMouseLeave;
  }

  if (direction === 'x') {
    padProps.boundY = padProps.boundY ?? 0;
  } else {
    padProps.boundX = padProps.boundX ?? 0;
  }

  padProps.renderOverlay = (pad, methods) => (
    <>
      <CarouselInner
        pad={pad}
        padMethods={methods}
        direction={direction}
        loop={loop}
        autoplayEnabled={autoplayEnabled}
        autoplayInterval={autoplayInterval}
        itemCount={itemCount}
        onActiveIndexChange={onActiveIndexChange}
        render={(state, methods) => {
          methodsRef.current = methods;

          return render ? render(state, methods) : children;
        }}
      />
      {renderOverlay ? renderOverlay(pad, methods) : null}
    </>
  );

  const content = (
    <GridContent
      width={width}
      height={height}
      itemWidth={width}
      itemHeight={height}
      direction={direction}
      itemCount={itemCount}
      renderItem={renderItem}
    />
  );

  if (loop) {
    return (
      <Loop direction={direction} {...padProps}>
        {content}
      </Loop>
    );
  }

  return <Pad {...padProps}>{content}</Pad>;
});

export default Carousel;
