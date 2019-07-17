import React, { Fragment, useMemo, useReducer } from 'react';
import Player from './Player';
import GridContent from '../GridContent';
import useIsomorphicLayoutEffect from '../hooks/useIsomorphicLayoutEffect';
import usePrevRef from '../hooks/usePrevRef';
import { reducer, initialState } from './carouselReducer';

const defaultCarouselProps = {
  itemCount: 0,
  renderItem: () => null,
  onSlideChange: () => {},
  slideTo: null,
  ...Player.defaultProps,
};

function Carousel({
  itemCount,
  renderItem,
  onSlideChange,
  slideTo,
  ...playerProps
}) {
  const { width, height, direction } = playerProps;
  const [state, dispatch] = useReducer(reducer, initialState);
  const { pageIndex, scrollTo } = state;
  const activeIndex = pageIndex % itemCount;
  const innerRef = usePrevRef({ activeIndex, itemCount });
  const prevInner = innerRef.current;

  useIsomorphicLayoutEffect(() => {
    if (activeIndex !== prevInner.activeIndex) {
      onSlideChange({ activeIndex, itemCount });
    }
  });

  useMemo(() => {
    if (playerProps.scrollTo) {
      dispatch({ type: 'setScrollTo', value: playerProps.scrollTo });
    }
  }, [playerProps.scrollTo]);

  useMemo(() => {
    if (slideTo) {
      dispatch({ type: 'slideTo', ...slideTo, ...innerRef.current });
    }
  }, [slideTo, innerRef]);

  const gridProps = {
    width,
    height,
    itemWidth: width,
    itemHeight: height,
    direction,
    itemCount,
    renderItem,
  };

  playerProps.scrollTo = scrollTo;

  let element = playerProps.children;

  if (typeof element === 'function') {
    element = element({ activeIndex, itemCount });
  }

  return (
    <Fragment>
      <Player {...playerProps}>
        {player => {
          if (player !== state.player) {
            dispatch({ type: 'setPlayer', value: player });
          }

          return <GridContent {...gridProps} />;
        }}
      </Player>
      {element}
    </Fragment>
  );
}

Carousel.defaultProps = defaultCarouselProps;
export default Carousel;
