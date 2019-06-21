import React, { useMemo, useState } from 'react';
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
  } = playerProps;
  const [player, setPlayer] = useState({});
  const [goTo, setGoTo] = useState(null);
  const prevPlayerRef = usePrevRef(player);

  useIsomorphicLayoutEffect(() => {
    const prevActiveIndex = prevPlayerRef.current.activeIndex;
    const activeIndex = player.activeIndex;

    if (prevActiveIndex !== activeIndex) {
      onSlideChange({ itemCount, activeIndex });
    }
  }, [onSlideChange, itemCount, player]);

  useMemo(() => {
    if (slideTo) {
      const { index, prev, next, animated } = slideTo;
      setGoTo({ prev, next, index, animated });
    }
  }, [slideTo]);

  const gridProps = {
    width,
    height,
    itemWidth: width,
    itemHeight: height,
    direction,
    itemCount,
    renderItem,
  };

  playerProps.goTo = goTo;

  return (
    <Player {...playerProps}>
      {playerState => {
        if (playerState !== player) {
          setPlayer(playerState);
        }
        return <GridContent {...gridProps} />;
      }}
    </Player>
  );
}

Carousel.defaultProps = defaultCarouselrProps;
export default Carousel;
