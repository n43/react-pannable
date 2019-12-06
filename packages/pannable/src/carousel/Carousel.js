import React, { Fragment, useMemo, useReducer } from 'react';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
import { usePrevRef } from '../hooks/usePrevRef';
import GridContent from '../pad/GridContent';
import Player from './Player';
import { reducer, initialState } from './carouselReducer';

const defaultCarouselProps = {
  itemCount: 0,
  renderItem: () => null,
  onActiveIndexChange: () => {},
  scrollToIndex: null,
  ...Player.defaultProps,
};

function Carousel(props) {
  const {
    itemCount: gridItemCount,
    renderItem,
    onActiveIndexChange,
    scrollToIndex,
    children,
    ...playerProps
  } = props;
  const {
    width,
    height,
    direction,
    scrollTo: playerScrollTo,
    renderOverlay,
  } = playerProps;
  const [state, dispatch] = useReducer(reducer, initialState);
  const prevStateRef = usePrevRef(state);

  const { activeIndex, itemCount, scrollTo, player } = state;
  const output = { activeIndex, itemCount };
  const prevState = prevStateRef.current;

  useIsomorphicLayoutEffect(() => {
    if (prevState.activeIndex !== activeIndex) {
      onActiveIndexChange(output);
    }
  });

  useMemo(() => {
    dispatch({ type: 'setScrollTo', value: playerScrollTo });
  }, [playerScrollTo]);

  useMemo(() => {
    if (scrollToIndex) {
      dispatch({ type: 'scrollToIndex', ...scrollToIndex });
    }
  }, [scrollToIndex]);

  playerProps.scrollTo = scrollTo;
  playerProps.renderOverlay = padAttrs => {
    const element = typeof children === 'function' ? children(state) : children;

    return (
      <Fragment>
        {renderOverlay(padAttrs)}
        {element}
      </Fragment>
    );
  };

  return (
    <Player {...playerProps}>
      {nextPlayer => {
        if (player !== nextPlayer) {
          dispatch({ type: 'setPlayer', value: nextPlayer });
        }

        const gridProps = {
          width,
          height,
          itemWidth: width,
          itemHeight: height,
          direction,
          itemCount: gridItemCount,
          renderItem,
        };

        return <GridContent {...gridProps} />;
      }}
    </Player>
  );
}

Carousel.defaultProps = defaultCarouselProps;
export default Carousel;
