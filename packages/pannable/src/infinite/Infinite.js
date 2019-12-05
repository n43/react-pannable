import React, { useReducer, useMemo, useRef, useEffect } from 'react';
import Pad from '../Pad';
import ListContent from '../ListContent';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
import { usePrevRef } from '../hooks/usePrevRef';
import { reducer, initialState } from './infiniteReducer';

const defaultInfiniteProps = {
  direction: 'y',
  spacing: 0,
  itemCount: 0,
  estimatedItemWidth: 0,
  estimatedItemHeight: 0,
  renderItem: () => null,
  renderHeader: () => null,
  renderFooter: () => null,
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
    renderHeader,
    renderFooter,
    scrollToIndex,
    children,
    ...padProps
  } = props;
  const { width, height, scrollToRect: padScrollToRect } = padProps;
  const [state, dispatch] = useReducer(reducer, initialState);
  const prevStateRef = usePrevRef(state);
  const listRef = useRef({});

  const { scrollToRect, scrolling, pad } = state;
  const prevState = prevStateRef.current;

  useIsomorphicLayoutEffect(() => {
    if (prevState.pad.contentSize !== pad.contentSize) {
      if (scrolling && scrollToIndex) {
        dispatch({
          type: 'scrollToIndex',
          ...scrollToIndex,
          list: listRef.current,
        });
      }
    }
  });

  useEffect(() => {
    if (prevState.pad.deceleration !== pad.deceleration) {
      if (!pad.deceleration && scrolling) {
        dispatch({ type: 'endScrolling' });
      }
    }
  });

  useMemo(() => {
    dispatch({ type: 'setScrollToRect', value: padScrollToRect });
  }, [padScrollToRect]);

  useMemo(() => {
    if (scrollToIndex) {
      dispatch({
        type: 'scrollToIndex',
        ...scrollToIndex,
        list: listRef.current,
      });
    }
  }, [scrollToIndex]);

  padProps.scrollToRect = scrollToRect;

  if (direction === 'x') {
    padProps.alwaysBounceY = false;
  } else {
    padProps.alwaysBounceX = false;
  }

  if (typeof children === 'function') {
    children(state);
  }

  return (
    <Pad {...padProps}>
      {nextPad => {
        if (pad !== nextPad) {
          dispatch({ type: 'setPad', value: nextPad });
        }

        const listProps = {
          width,
          height,
          direction,
          itemCount: 3,
          renderItem(attrs) {
            const { itemIndex, Item } = attrs;

            if (itemIndex === 0) {
              return renderHeader(attrs);
            }
            if (itemIndex === 2) {
              return renderFooter(attrs);
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

            return (
              <Item forceRender>
                <ListContent {...listProps}>
                  {layout => {
                    listRef.current.body = layout;
                  }}
                </ListContent>
              </Item>
            );
          },
        };

        return (
          <ListContent {...listProps}>
            {layout => {
              listRef.current.box = layout;
            }}
          </ListContent>
        );
      }}
    </Pad>
  );
}

Infinite.defaultProps = defaultInfiniteProps;
export default Infinite;
