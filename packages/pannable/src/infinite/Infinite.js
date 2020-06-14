import React, {
  useEffect,
  useMemo,
  useRef,
  useCallback,
  useReducer,
} from 'react';
import Pad from '../pad/Pad';
import ListContent from '../pad/ListContent';
import { reducer, initialInfiniteState } from './infiniteReducer';

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
  const {
    width,
    height,
    scrollTo: padScrollTo,
    onContentResize: onPadContentResize,
    onDecelerationEnd: onPadDecelerationEnd,
  } = padProps;
  const [state, dispatch] = useReducer(reducer, initialInfiniteState);
  const listRef = useRef({});

  const onContentResize = useCallback(
    contentSize => {
      if (state.scroll) {
        dispatch({ type: 'scrollRecalculate', list: listRef.current });
      }

      onPadContentResize(contentSize);
    },
    [onPadContentResize, state.scroll]
  );

  const onDecelerationEnd = useCallback(
    evt => {
      if (state.scroll) {
        dispatch({ type: 'scrollEnd' });
      }

      onPadDecelerationEnd(evt);
    },
    [onPadDecelerationEnd, state.scroll]
  );

  useMemo(() => {
    dispatch({ type: 'setScrollTo', value: padScrollTo });
  }, [padScrollTo]);

  useEffect(() => {
    if (scrollToIndex) {
      dispatch({
        type: 'scrollToIndex',
        value: scrollToIndex,
        list: listRef.current,
      });
    }
  }, [scrollToIndex]);

  padProps.scrollTo = state.scrollTo;
  padProps.onContentResize = onContentResize;
  padProps.onDecelerationEnd = onDecelerationEnd;

  if (direction === 'x') {
    padProps.alwaysBounceY = false;
  } else {
    padProps.alwaysBounceX = false;
  }

  return (
    <Pad {...padProps}>
      {pad => {
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

            const bodyProps = {
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
                <ListContent {...bodyProps}>
                  {layout => {
                    listRef.current.body = layout;
                  }}
                </ListContent>
              </Item>
            );
          },
        };

        if (typeof children === 'function') {
          children({ ...state, pad });
        }

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
