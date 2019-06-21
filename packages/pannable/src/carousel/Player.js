import React, { useCallback, useRef, useMemo, useReducer } from 'react';
import Pad from '../Pad';
import useIsomorphicLayoutEffect from '../hooks/useIsomorphicLayoutEffect';
import ListContent from '../ListContent';
import { reducer, initialState } from './playerReducer';

const defaultPlayerProps = {
  direction: 'x',
  autoplayEnabled: true,
  autoplayInterval: 5000,
  loop: true,
  ...Pad.defaultProps,
  pagingEnabled: true,
  directionalLockEnabled: true,
};

function Player({
  direction = defaultPlayerProps.direction,
  autoplayEnabled = defaultPlayerProps.autoplayEnabled,
  autoplayInterval = defaultPlayerProps.autoplayInterval,
  loop = defaultPlayerProps.loop,
  pagingEnabled = defaultPlayerProps.pagingEnabled,
  directionalLockEnabled = defaultPlayerProps.directionalLockEnabled,
  ...padProps
}) {
  const {
    onMouseEnter = defaultPlayerProps.onMouseEnter,
    onMouseLeave = defaultPlayerProps.onMouseLeave,
    onScroll = defaultPlayerProps.onScroll,
    onContentResize = defaultPlayerProps.onContentResize,
  } = padProps;

  const playerRef = useRef({ autoplayTimer: null });
  const [state, dispatch] = useReducer(reducer, initialState);
  const { pad, mouseEntered, loopCount, loopOffset, scrollTo } = state;
  const { drag, deceleration } = pad;

  playerRef.current.pad = pad;

  const go = useCallback(
    ({ delta, animated }) => {
      const {
        contentOffset,
        size,
        contentSize,
        drag,
        deceleration,
        pagingEnabled,
      } = playerRef.current.pad;

      if (drag || deceleration) {
        return;
      }

      const offset = getContentOffsetForPlayback(
        delta,
        contentOffset,
        size,
        contentSize,
        pagingEnabled,
        loopCount,
        direction
      );

      dispatch({ type: 'setScrollTo', offset, animated });
    },
    [loopCount, direction]
  );

  const rewind = useCallback(() => {
    go({ delta: -1, animated: true });
  }, [go]);

  const forward = useCallback(() => {
    go({ delta: 1, animated: true });
  }, [go]);

  const startPlaying = useCallback(() => {
    const autoplayTimer = playerRef.current.autoplayTimer;
    if (autoplayTimer) {
      clearTimeout(autoplayTimer);
    }

    playerRef.current.autoplayTimer = setTimeout(() => {
      playerRef.current.autoplayTimer = undefined;
      forward();
    }, autoplayInterval);
  }, [autoplayInterval, forward]);

  const stopPlaying = useCallback(() => {
    const autoplayTimer = playerRef.current.autoplayTimer;
    if (autoplayTimer) {
      clearTimeout(autoplayTimer);
      playerRef.current.autoplayTimer = undefined;
    }
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (!autoplayEnabled) {
      return;
    }

    if (drag || deceleration) {
      return;
    }
    if (mouseEntered) {
      return;
    }

    startPlaying();

    return stopPlaying;
  }, [
    autoplayEnabled,
    mouseEntered,
    drag,
    deceleration,
    startPlaying,
    stopPlaying,
  ]);

  useMemo(() => {
    if (!loop) {
      dispatch({ type: 'disableLoop' });
    }
  }, [loop]);

  const onPadScroll = useCallback(
    evt => {
      dispatch({ type: 'padScroll', direction });

      onScroll(evt);
    },
    [onScroll, direction]
  );

  const onPadContentResize = useCallback(
    contentSize => {
      dispatch({ type: 'padContentResize', direction });
      onContentResize(contentSize);
    },
    [onContentResize, direction]
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
  padProps.pagingEnabled = pagingEnabled;
  padProps.directionalLockEnabled = directionalLockEnabled;

  let element = padProps.children;

  if (typeof element === 'function') {
    element = element({ go, rewind, forward });
  }

  return (
    <Pad {...padProps}>
      {padState => {
        if (padState !== pad) {
          dispatch({ type: 'setPad', value: padState });
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

function getContentOffsetForPlayback(
  delta,
  contentOffset,
  size,
  contentSize,
  pagingEnabled,
  loopCount,
  direction
) {
  const [width, x, y] =
    direction === 'y' ? ['height', 'y', 'x'] : ['width', 'x', 'y'];

  const sizeWidth = size[width];
  let offsetX = contentOffset[x] - delta * sizeWidth;

  if (loopCount === 1) {
    let minOffsetX = Math.min(sizeWidth - contentSize[width], 0);

    if (pagingEnabled && sizeWidth > 0) {
      minOffsetX = sizeWidth * Math.ceil(minOffsetX / sizeWidth);
    }

    if (offsetX < minOffsetX) {
      offsetX = minOffsetX - sizeWidth < offsetX ? minOffsetX : 0;
    } else if (0 < offsetX) {
      offsetX = offsetX < sizeWidth ? 0 : minOffsetX;
    }
  }

  return { [x]: offsetX, [y]: contentOffset[y] };
}

Player.defaultProps = defaultPlayerProps;
export default Player;
