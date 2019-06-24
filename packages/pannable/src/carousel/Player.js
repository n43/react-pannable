import React, { useCallback, useMemo, useReducer, useEffect } from 'react';
import Pad from '../Pad';
import ListContent from '../ListContent';
import { reducer, initialState } from './playerReducer';

const defaultPlayerProps = {
  direction: 'x',
  autoplayEnabled: true,
  autoplayInterval: 5000,
  loop: true,
  goTo: null,
  ...Pad.defaultProps,
  pagingEnabled: true,
  directionalLockEnabled: true,
};

function Player({
  direction = defaultPlayerProps.direction,
  autoplayEnabled = defaultPlayerProps.autoplayEnabled,
  autoplayInterval = defaultPlayerProps.autoplayInterval,
  loop = defaultPlayerProps.loop,
  goTo = defaultPlayerProps.goTo,
  ...padProps
}) {
  const {
    pagingEnabled = defaultPlayerProps.pagingEnabled,
    directionalLockEnabled = defaultPlayerProps.directionalLockEnabled,
    onMouseEnter = defaultPlayerProps.onMouseEnter,
    onMouseLeave = defaultPlayerProps.onMouseLeave,
    onScroll = defaultPlayerProps.onScroll,
    onContentResize = defaultPlayerProps.onContentResize,
  } = padProps;

  if (typeof padProps.pagingEnabled === 'undefined') {
    padProps.pagingEnabled = pagingEnabled;
  }
  if (typeof padProps.directionalLockEnabled === 'undefined') {
    padProps.directionalLockEnabled = directionalLockEnabled;
  }

  const [state, dispatch] = useReducer(reducer, initialState);
  const { pad, mouseEntered, loopCount, loopOffset, scrollTo } = state;
  const { drag, deceleration } = pad;

  useEffect(() => {
    if (!autoplayEnabled || drag || deceleration || mouseEntered) {
      return;
    }

    let autoplayTimer = setTimeout(() => {
      autoplayTimer = undefined;
      dispatch({ type: 'goTo', next: true, animated: true });
    }, autoplayInterval);

    return () => {
      if (autoplayTimer) {
        clearTimeout(autoplayTimer);
      }
    };
  }, [autoplayEnabled, mouseEntered, drag, deceleration, autoplayInterval]);

  useMemo(() => {
    if (goTo) {
      dispatch({ type: 'goTo', ...goTo });
    }
  }, [goTo]);

  useMemo(() => {
    if (padProps.scrollTo) {
      dispatch({ type: 'setScrollTo', value: padProps.scrollTo });
    }
  }, [padProps.scrollTo]);

  useMemo(() => {
    if (!loop) {
      dispatch({ type: 'disableLoop' });
    }
  }, [loop]);

  useMemo(() => {
    dispatch({ type: 'setDirection', value: direction });
  }, [direction]);

  const onPadScroll = useCallback(
    evt => {
      dispatch({ type: 'padScroll' });
      onScroll(evt);
    },
    [onScroll]
  );

  const onPadContentResize = useCallback(
    contentSize => {
      dispatch({ type: 'padContentResize' });
      onContentResize(contentSize);
    },
    [onContentResize]
  );

  const onPadMouseEnter = useCallback(
    evt => {
      dispatch({ type: 'setMouseEntered', value: true });

      if (onMouseEnter) {
        onMouseEnter(evt);
      }
    },
    [onMouseEnter]
  );

  const onPadMouseLeave = useCallback(
    evt => {
      dispatch({ type: 'setMouseEntered', value: false });

      if (onMouseLeave) {
        onMouseLeave(evt);
      }
    },
    [onMouseLeave]
  );

  if (loop) {
    padProps.onScroll = onPadScroll;
    padProps.onContentResize = onPadContentResize;
  }

  if (direction === 'x') {
    padProps.alwaysBounceY = false;
  } else {
    padProps.alwaysBounceX = false;
  }

  if (autoplayEnabled) {
    padProps.onMouseEnter = onPadMouseEnter;
    padProps.onMouseLeave = onPadMouseLeave;
  }

  padProps.scrollTo = scrollTo;

  return (
    <Pad {...padProps}>
      {padState => {
        if (padState !== pad) {
          dispatch({ type: 'setPad', value: padState });
        }

        let element = padProps.children;

        if (typeof element === 'function') {
          element = element(state);
        }

        return (
          <ListContent
            direction={direction}
            itemCount={loopCount}
            renderItem={({ Item, itemIndex }) => (
              <Item key={itemIndex + loopOffset} hash="loop">
                {element}
              </Item>
            )}
          />
        );
      }}
    </Pad>
  );
}

Player.defaultProps = defaultPlayerProps;
export default Player;
