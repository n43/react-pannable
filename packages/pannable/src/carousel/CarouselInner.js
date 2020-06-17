import React, { useMemo, useCallback, useReducer } from 'react';
import GridContent from '../pad/GridContent';
import { reducer, initialCarouselState } from './carouselReducer';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';

function CarouselInner(props) {
  const {
    pad,
    onAdjust,
    onChildrenRender,
    direction,
    loop,
    autoplayEnabled,
    autoplayInterval,
    itemCount,
    renderItem,
    onActiveIndexChange,
    scrollToIndex,
    children,
  } = props;
  const [state, dispatch] = useReducer(reducer, initialCarouselState);

  useMemo(() => {
    dispatch({
      type: 'syncProps',
      props: {
        pad,
        direction,
        loop,
        itemCount,
      },
    });
  }, [pad, direction, loop, itemCount]);

  useIsomorphicLayoutEffect(() => {
    if (state.scrollTo) {
      onAdjust(state.scrollTo);
    }
  }, [state.scrollTo]);

  useIsomorphicLayoutEffect(() => {
    if (typeof children === 'function') {
      onChildrenRender(children(state));
    }
  }, [children]);

  const gridProps = {
    width: state.pad.size.width,
    height: state.pad.size.height,
    itemWidth: state.pad.size.width,
    itemHeight: state.pad.size.height,
    direction: state.direction,
    itemCount: state.itemCount,
    renderItem,
  };

  return <GridContent {...gridProps} />;
}

export default CarouselInner;
