import React, { useCallback, useRef, useMemo, useState } from 'react';
import Player from './Player';
import GridContent from '../GridContent';
import useIsomorphicLayoutEffect from '../hooks/useIsomorphicLayoutEffect';
import usePrevRef from '../hooks/usePrevRef';

const defaultCarouselrProps = {
  ...Player.defaultProps,
  itemCount: 0,
  renderItem: () => null,
  onSlideChange: () => {},
  slideTo: null,
};

function Carousel({
  itemCount = defaultCarouselrProps.itemCount,
  renderItem = defaultCarouselrProps.renderItem,
  onSlideChange = defaultCarouselrProps.onSlideChange,
  slideTo = defaultCarouselrProps.slideTo,
  ...playerProps
}) {
  const {
    width = defaultCarouselrProps.width,
    height = defaultCarouselrProps.height,
    direction = defaultCarouselrProps.direction,
    onScroll = defaultCarouselrProps.onScroll,
  } = playerProps;
  const [activeIndex, setActiveIndex] = useState(0);
  const prevActiveIndexRef = usePrevRef(activeIndex);
  const carouselRef = useRef({ activeIndex, player: null });

  carouselRef.current.activeIndex = activeIndex;

  useIsomorphicLayoutEffect(() => {
    if (prevActiveIndexRef.current !== activeIndex) {
      onSlideChange({ itemCount, activeIndex });
    }
  }, [onSlideChange, itemCount, activeIndex]);

  useMemo(() => {
    if (!slideTo) {
      return;
    }

    const { index, prev, next, animated } = slideTo;
    const player = carouselRef.current.player;

    if (prev) {
      player.rewind();
      return;
    }

    if (next) {
      player.forward();
      return;
    }

    const activeIndex = carouselRef.current.activeIndex;
    player.go({ delta: index - activeIndex, animated });
  }, [slideTo]);

  const onPlayerScroll = useCallback(
    evt => {
      const { contentOffset, size, contentSize } = evt;
      const activeIndex = carouselRef.current.activeIndex;
      const nextActiveIndex = calculateActiveIndex(
        contentOffset,
        size,
        contentSize,
        itemCount,
        direction
      );

      if (nextActiveIndex !== activeIndex) {
        setActiveIndex(nextActiveIndex);
      }

      onScroll(evt);
    },
    [direction, itemCount, onScroll]
  );

  playerProps.onScroll = onPlayerScroll;

  const gridProps = {
    width,
    height,
    itemWidth: width,
    itemHeight: height,
    direction,
    itemCount,
    renderItem,
  };

  return (
    <Player {...playerProps}>
      {apis => {
        carouselRef.current.player = apis;
        return <GridContent {...gridProps} />;
      }}
    </Player>
  );
}

function calculateActiveIndex(offset, size, cSize, itemCount, direction) {
  const [width, x] = direction === 'y' ? ['height', 'y'] : ['width', 'x'];

  const offsetX = Math.min(Math.max(-cSize[width], offset[x]), 0);
  const index = Math.round(-offsetX / size[width]);

  return index % itemCount;
}

Carousel.defaultProps = defaultCarouselrProps;
export default Carousel;
