import React, { Fragment, useMemo, useReducer } from 'react';
import Player from './Player';
import GridContent from '../GridContent';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
import { usePrevRef } from '../hooks/usePrevRef';
import { reducer, initialState } from './carouselReducer';

const defaultCarouselProps = {
  itemCount: 0,
  renderItem: () => null,
  onSlideChange: () => {},
  slideTo: null,
  ...Player.defaultProps,
};

function Carousel(props) {
  const {
    itemCount: gridItemCount,
    renderItem,
    onSlideChange,
    slideTo,
    children,
    ...playerProps
  } = props;
  const { width, height, direction, scrollTo: playerScrollTo } = playerProps;
  const [state, dispatch] = useReducer(reducer, initialState);
  const prevStateRef = usePrevRef(state);

  const { activeIndex, itemCount, scrollTo } = state;
  const prevState = prevStateRef.current;

  useIsomorphicLayoutEffect(() => {
    if (prevState.activeIndex !== activeIndex) {
      onSlideChange({ activeIndex, itemCount });
    }
  });

  useMemo(() => {
    if (playerScrollTo) {
      dispatch({ type: 'setScrollTo', value: playerScrollTo });
    }
  }, [playerScrollTo]);

  useMemo(() => {
    if (slideTo) {
      dispatch({ type: 'slideTo', ...slideTo });
    }
  }, [slideTo]);

  const gridProps = {
    width,
    height,
    itemWidth: width,
    itemHeight: height,
    direction,
    itemCount: gridItemCount,
    renderItem,
  };

  playerProps.scrollTo = scrollTo;

  const element =
    typeof children === 'function'
      ? children({ activeIndex, itemCount })
      : children;

  return (
    <Fragment>
      <Player {...playerProps}>
        {player => {
          if (state.player !== player) {
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
