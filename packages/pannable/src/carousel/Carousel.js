import React from 'react';
import CarouselInner from './CarouselInner';
import Loop from './Loop';
import Pad from '../pad/Pad';

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

  const renderInner = (pad, methods) => {
    const carouselProps = {
      pad,
      onAdjust: methods._scrollTo,
      onChildrenRender: methods._renderOverlay,
      direction,
      loop,
      autoplayEnabled,
      autoplayInterval,
      itemCount,
      renderItem,
      onActiveIndexChange,
      scrollToIndex,
    };

    return (
      <CarouselInner {...carouselProps}>
        {state => {
          return typeof children === 'function'
            ? children(state, methods)
            : children;
        }}
      </CarouselInner>
    );
  };

  if (loop) {
    return (
      <Loop direction={direction} {...padProps}>
        {(loop, methods) => renderInner(loop.pad, methods)}
      </Loop>
    );
  }

  if (direction === 'x') {
    padProps.alwaysBounceY = false;
  } else {
    padProps.alwaysBounceX = false;
  }

  return <Pad {...padProps}>{(pad, methods) => renderInner(pad, methods)}</Pad>;
}

Carousel.defaultProps = defaultCarouselProps;
export default Carousel;
