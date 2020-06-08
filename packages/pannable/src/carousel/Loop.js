import React, { useCallback, useMemo, useReducer } from 'react';
import Pad from '../pad/Pad';
import ListContent from '../pad/ListContent';
import { reducer, initialState } from './loopReducer';

const defaultLoopProps = {
  direction: 'x',
  ...Pad.defaultProps,
  directionalLockEnabled: true,
};

function Loop(props) {
  const { direction, children, ...padProps } = props;
  const {
    width,
    height,
    scrollTo: padScrollTo,
    onScroll: onPadScroll,
    onContentResize: onPadContentResize,
  } = padProps;
  const [state, dispatch] = useReducer(reducer, initialState);
  const size = useMemo(() => ({ width, height }), [width, height]);

  const onScroll = useCallback(
    evt => {
      const { contentOffset } = evt;

      dispatch({ type: 'validate', direction, size, contentOffset });

      onPadScroll(evt);
    },
    [direction, size, onPadScroll, dispatch]
  );

  const onContentResize = useCallback(
    contentSize => {
      dispatch({ type: 'calculateLoop', direction, size, contentSize });

      onPadContentResize(contentSize);
    },
    [direction, size, onPadContentResize, dispatch]
  );

  useMemo(() => {
    dispatch({ type: 'calculateLoop', direction, size });
  }, [direction, size, dispatch]);

  useMemo(() => {
    if (!padScrollTo) {
      return;
    }

    dispatch({ type: 'setScrollTo', value: padScrollTo });
  }, [padScrollTo]);

  padProps.scrollTo = state.scrollTo;
  padProps.onScroll = onScroll;
  padProps.onContentResize = onContentResize;

  if (direction === 'x') {
    padProps.alwaysBounceY = false;
  } else {
    padProps.alwaysBounceX = false;
  }

  return (
    <Pad {...padProps}>
      {pad => {
        const element =
          typeof children === 'function'
            ? children({ ...state, pad })
            : children;

        return (
          <ListContent
            direction={direction}
            itemCount={state.loopCount}
            renderItem={({ Item, itemIndex }) => (
              <Item key={itemIndex + state.loopOffset} hash="Loop">
                {element}
              </Item>
            )}
          />
        );
      }}
    </Pad>
  );
}

Loop.defaultProps = defaultLoopProps;
export default Loop;
