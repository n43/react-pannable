import { CarouselScrollTo, CarouselEvent } from './carouselReducer';
import CarouselInner from './CarouselInner';
import Loop from './Loop';
import Pad, { defaultPadProps, PadProps } from '../pad/Pad';
import GridContent, { GridLayoutAttrs } from '../pad/GridContent';
import { XY } from '../interfaces';
import React, { useMemo, useRef, useState, useCallback } from 'react';

export interface CarouselProps extends PadProps {
  direction: XY;
  itemCount: number;
  renderItem: (attrs: GridLayoutAttrs) => React.ReactNode;
  loop?: boolean;
  autoplayEnabled?: boolean;
  autoplayInterval?: number;
  onActiveIndexChange?: (evt: CarouselEvent) => void;
  scrollToIndex?: CarouselScrollTo | null;
}

const defaultCarouselProps: CarouselProps = {
  direction: 'x',
  loop: true,
  autoplayEnabled: true,
  autoplayInterval: 5000,
  itemCount: 0,
  renderItem: () => null,
  onActiveIndexChange: () => {},
  scrollToIndex: null,
  ...defaultPadProps,
  pagingEnabled: true,
  directionalLockEnabled: true,
};

const Carousel: React.FC<
  CarouselProps & Omit<React.HTMLAttributes<HTMLDivElement>, 'onScroll'>
> = React.memo((props) => {
  const {
    direction,
    loop,
    autoplayEnabled,
    autoplayInterval,
    itemCount,
    renderItem,
    onActiveIndexChange,
    scrollToIndex,
    children,
    ...padProps
  } = props as Required<CarouselProps> &
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onScroll'>;
  const { width, height, renderOverlay, onMouseEnter, onMouseLeave } = padProps;
  const [autoplay, setAutoplay] = useState(false);
  const delegate = { onMouseEnter, onMouseLeave };
  const delegateRef = useRef(delegate);
  delegateRef.current = delegate;

  const padOnMouseEnter = useCallback((evt) => {
    setAutoplay(false);

    if (delegateRef.current.onMouseEnter) {
      delegateRef.current.onMouseEnter(evt);
    }
  }, []);
  const padOnMouseLeave = useCallback((evt) => {
    setAutoplay(true);

    if (delegateRef.current.onMouseLeave) {
      delegateRef.current.onMouseLeave(evt);
    }
  }, []);

  useMemo(() => {
    setAutoplay(autoplayEnabled);
  }, [autoplayEnabled]);

  if (autoplayEnabled) {
    padProps.onMouseEnter = padOnMouseEnter;
    padProps.onMouseLeave = padOnMouseLeave;
  }

  padProps.renderOverlay = (pad, methods) => (
    <>
      <CarouselInner
        pad={pad}
        direction={direction}
        loop={loop}
        autoplayEnabled={autoplay}
        autoplayInterval={autoplayInterval}
        itemCount={itemCount}
        onActiveIndexChange={onActiveIndexChange}
        onAdjust={methods._scrollTo}
        scrollToIndex={scrollToIndex}
        children={children}
      />
      {renderOverlay(pad, methods)}
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

  if (direction === 'x') {
    padProps.alwaysBounceY = false;
  } else {
    padProps.alwaysBounceX = false;
  }

  return <Pad {...padProps}>{content}</Pad>;
});

Carousel.defaultProps = defaultCarouselProps;

export default Carousel;
