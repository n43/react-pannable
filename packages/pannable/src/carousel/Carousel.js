import React, { useMemo, useRef, useState } from 'react';
import CarouselInner from './CarouselInner';
import Loop from './Loop';
import Pad from '../pad/Pad';
import GridContent from '../pad/GridContent';

const defaultCarouselProps = {
  direction: 'x',
  loop: true,
  autoplayEnabled: true,
  autoplayInterval: 5000,
  itemCount: 0,
  renderItem: () => null,
  onActiveIndexChange: () => {},
  scrollToIndex: null,
  ...Pad.defaultProps,
  pagingEnabled: true,
  directionalLockEnabled: true,
};

function Carousel(props) {
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
  } = props;
  const { width, height, renderOverlay, onMouseEnter, onMouseLeave } = padProps;
  const [autoplay, setAutoplay] = useState(false);
  const responseRef = useRef({
    onPadMouseEnter(evt) {
      setAutoplay(false);

      if (responseRef.current.onMouseEnter) {
        responseRef.current.onMouseEnter(evt);
      }
    },
    onPadMouseLeave(evt) {
      setAutoplay(true);

      if (responseRef.current.onMouseLeave) {
        responseRef.current.onMouseLeave(evt);
      }
    },
  });

  responseRef.current.onMouseEnter = onMouseEnter;
  responseRef.current.onMouseLeave = onMouseLeave;

  useMemo(() => {
    setAutoplay(autoplayEnabled);
  }, [autoplayEnabled]);

  if (autoplayEnabled) {
    padProps.onMouseEnter = responseRef.current.onPadMouseEnter;
    padProps.onMouseLeave = responseRef.current.onPadMouseLeave;
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
}

Carousel.defaultProps = defaultCarouselProps;

export default Carousel;
