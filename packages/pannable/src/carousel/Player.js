import React, {
  useState,
  useCallback,
  useRef,
  useMemo,
  useReducer,
} from 'react';
import Pad from '../Pad';
import useIsomorphicLayoutEffect from '../hooks/useIsomorphicLayoutEffect';
import ListContent from '../ListContent';
import { reducer, initialState } from './padReducer';

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
  } = padProps;

  const playerRef = useRef({ autoplayTimer: null });
  const [state, dispatch] = useReducer(reducer, initialState);
  const { padState, mouseEntered, loopCount, loopOffset, scrollTo } = state;
  const { drag, deceleration, contentOffset, contentSize } = padState;

  const go = useCallback(({ delta, animated }) => {
    const { delta, animated } = relativeOffset;
    const { loopCount, direction } = playerRef.current;

    const {
      contentOffset,
      size,
      contentSize,
      drag,
      deceleration,
      pagingEnabled,
    } = playerRef.current.padState;

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

    setScrollTo({ offset, animated });
  }, []);

  const rewind = useCallback(() => {
    setRelativeOffset({ delta: -1, animated: true });
  }, []);

  const forward = useCallback(() => {
    setRelativeOffset({ delta: 1, animated: true });
  }, []);

  const startPlaying = useCallback(() => {
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

  const adjustedContentOffset = useMemo(() => {
    return getAdjustedContentOffsetForLoop(
      contentOffset,
      size,
      contentSize,
      loopCount,
      direction
    );
  }, [contentOffset, size, contentSize, loopCount, direction]);

  const nextLoopCount = useMemo(() => {
    return calculateLoopCount(size, contentSize, loopCount, direction);
  }, [size, contentSize, loopCount, direction]);

  useIsomorphicLayoutEffect(() => {
    dispatch({
      type: 'updateLoopCount',
      loopCount: nextLoopCount,
      loopOffset: 0,
    });
  }, [nextLoopCount, loopOffset]);

  useIsomorphicLayoutEffect(() => {
    const [nextContentOffset, delta] = adjustedContentOffset;

    if (contentOffset !== adjustedContentOffset) {
      dispatch({
        type: 'setScrollTo',
        offset: nextContentOffset,
        animated: false,
      });
      dispatch({ type: 'setLoopOffset', value: loopOffset + delta });
    }
  }, [adjustedContentOffset, loopOffset]);

  useMemo(() => {
    if (!loop) {
      dispatch({ type: 'disableLoop' });
    }
  }, [loop]);

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
        dispatch({ type: 'setPadState', pad: padState });

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

function calculateLoopCount(size, contentSize, loopCount, direction) {
  const width = direction === 'y' ? 'height' : 'width';

  const itemWidth = contentSize[width] / loopCount;
  const sizeWidth = size[width];

  if (!itemWidth || !sizeWidth) {
    return 1;
  }

  return 2 + Math.floor(sizeWidth / itemWidth);
}

function getAdjustedContentOffsetForLoop(
  contentOffset,
  size,
  contentSize,
  loopCount,
  direction
) {
  if (loopCount === 1) {
    return [contentOffset, 0];
  }

  const [width, x, y] =
    direction === 'y' ? ['height', 'y', 'x'] : ['width', 'x', 'y'];

  const contentWidth = contentSize[width];
  const sizeWidth = size[width];
  const itemWidth = contentWidth / loopCount;
  const bufferWidth = 0.5 * (itemWidth - sizeWidth);

  let maxOffsetX = 0;
  let minOffsetX = sizeWidth - contentWidth;
  let offsetX = contentOffset[x];
  let delta = 0;

  offsetX = maxOffsetX - ((maxOffsetX - offsetX) % (maxOffsetX - minOffsetX));

  maxOffsetX -= bufferWidth;
  minOffsetX += bufferWidth;

  if (offsetX < minOffsetX) {
    delta = loopCount - 1;
  } else if (maxOffsetX < offsetX) {
    delta = 1 - loopCount;
  }

  if (delta === 0) {
    return [contentOffset, 0];
  }

  offsetX += itemWidth * delta;

  return [{ [x]: offsetX, [y]: contentOffset[y] }, delta];
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
