import React, { Fragment, useReducer, useMemo } from 'react';
import Pad from '../Pad';
import ListContent from '../ListContent';
import { reducer, initialState } from './infiniteReducer';

const defaultInfiniteProps = {
  direction: 'y',
  spacing: 0,
  itemCount: 0,
  estimatedItemWidth: 0,
  estimatedItemHeight: 0,
  renderItem: () => null,
  scrollToIndex: null,
  ...Pad.defaultProps,
  directionalLockEnabled: true,
};

function Infinite(props) {
  const {
    direction,
    spacing,
    itemCount,
    estimatedItemWidth,
    estimatedItemHeight,
    renderItem,
    scrollToIndex,
    children,
    ...padProps
  } = props;
  const { width, height, scrollTo: padScrollTo } = padProps;
  const [state, dispatch] = useReducer(reducer, initialState);

  const { scrollTo, pad } = state;

  useMemo(() => {
    dispatch({ type: 'setScrollTo', value: padScrollTo });
  }, [padScrollTo]);

  useMemo(() => {
    if (scrollToIndex) {
      dispatch({ type: 'scrollToIndex', ...scrollToIndex });
    }
  }, [scrollToIndex]);

  padProps.scrollTo = scrollTo;

  if (direction === 'x') {
    padProps.alwaysBounceY = false;
  } else {
    padProps.alwaysBounceX = false;
  }

  const element = typeof children === 'function' ? children() : children;

  return (
    <Fragment>
      <Pad {...padProps}>
        {nextPad => {
          if (pad !== nextPad) {
            dispatch({ type: 'setPad', value: nextPad });
          }

          const listProps = {
            width,
            height,
            direction,
            spacing,
            itemCount,
            estimatedItemWidth,
            estimatedItemHeight,
            renderItem,
          };

          return <ListContent {...listProps} />;
        }}
      </Pad>
      {element}
    </Fragment>
  );
}

Infinite.defaultProps = defaultInfiniteProps;
export default Infinite;
