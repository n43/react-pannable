import React, { useMemo, useState } from 'react';
import Player from './Player';
import GridContent from '../GridContent';
import useIsomorphicLayoutEffect from '../hooks/useIsomorphicLayoutEffect';
import usePrevRef from '../hooks/usePrevRef';
import { initialState } from './playerReducer';

const defaultCarouselrProps = {
  ...Player.defaultProps,
  itemCount: 0,
  renderItem: () => null,
  onSlideChange: () => {},
  slideTo: null,
};

function Carousel({
  itemCount,
  renderItem,
  onSlideChange,
  slideTo,
  ...playerProps
}) {
  const { width, height, direction } = playerProps;
  const [player, setPlayer] = useState(initialState);
  const [goTo, setGoTo] = useState(null);
  const prevPlayerRef = usePrevRef(player);
  const { activeIndex } = player;

  useIsomorphicLayoutEffect(() => {
    const prevPlayer = prevPlayerRef.current;

    if (prevPlayer.activeIndex !== activeIndex) {
      onSlideChange({ itemCount, activeIndex });
    }
  });

  useMemo(() => {
    if (slideTo) {
      setGoTo(slideTo);
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
