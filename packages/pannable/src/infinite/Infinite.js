import React, {
  useMemo,
  useRef,
  useEffect,
  useCallback,
  useReducer,
} from 'react';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
import { usePrevRef } from '../hooks/usePrevRef';
import Pad from '../pad/Pad';
import ListContent from '../pad/ListContent';
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
  onStateChange: () => {},
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
    onStateChange,
    scrollToIndex,
    children,
    ...padProps
  } = props;
  const { width, height, scrollToRect: padScrollToRect } = padProps;
  const [state, dispatch] = useReducer(reducer, initialState);
  const prevStateRef = usePrevRef(state);
  const prevState = prevStateRef.current;
  const listRef = useRef({});

  const onPadStateChange = useCallback(value => {
    dispatch({ type: 'setPad', value });
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (prevState !== state) {
      onStateChange(state);
    }

    if (prevState.pad.contentSize !== state.pad.contentSize) {
      if (state.scrolling && scrollToIndex) {
        dispatch({
          type: 'scrollToIndex',
          ...scrollToIndex,
          list: listRef.current,
        });
      }
    }
  });

  useEffect(() => {
    if (prevState.pad.deceleration !== state.pad.deceleration) {
      if (!state.pad.deceleration && state.scrolling) {
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

  padProps.scrollToRect = state.scrollToRect;
  padProps.onStateChange = onPadStateChange;

  if (direction === 'x') {
    padProps.alwaysBounceY = false;
  } else {
    padProps.alwaysBounceX = false;
  }

  if (typeof children === 'function') {
    children(state);
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
        <Item hash="Infinite_body" forceRender>
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
    <Pad {...padProps}>
      <ListContent {...listProps}>
        {layout => {
          listRef.current.box = layout;
        }}
      </ListContent>
    </Pad>
  );
}

Infinite.defaultProps = defaultInfiniteProps;
export default Infinite;
