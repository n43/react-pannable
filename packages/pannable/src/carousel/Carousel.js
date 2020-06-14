import React, { useMemo, useCallback, useReducer } from 'react';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
import { usePrevRef } from '../hooks/usePrevRef';
import GridContent from '../pad/GridContent';
import Pad from '../pad/Pad';
import Player from './Player';
import { reducer, initialState } from './carouselReducer';

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
    itemCount: gridItemCount,
    renderItem,
    onStateChange,
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
  const prevState = prevStateRef.current;

  const onPlayerStateChange = useCallback(value => {
    dispatch({ type: 'setPlayer', value });
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (prevState !== state) {
      onStateChange(state);
    }

    const output = {
      activeIndex: state.activeIndex,
      itemCount: state.itemCount,
    };

    if (prevState.activeIndex !== state.activeIndex) {
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

  playerProps.scrollTo = state.scrollTo;
  playerProps.onStateChange = onPlayerStateChange;
  playerProps.renderOverlay = pad => {
    const element = typeof children === 'function' ? children(state) : children;

    return (
      <React.Fragment>
        {renderOverlay(pad)}
        {element}
      </React.Fragment>
    );
  };

  const gridProps = {
    width,
    height,
    itemWidth: width,
    itemHeight: height,
    direction,
    itemCount: gridItemCount,
    renderItem,
  };

  return (
    <Player {...playerProps}>
      <GridContent {...gridProps} />
    </Player>
  );
}

Carousel.defaultProps = defaultCarouselProps;
export default Carousel;
