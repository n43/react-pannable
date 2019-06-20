import React, { useState, useCallback, useRef, useMemo } from 'react';
import Pad from '../Pad';
import useIsomorphicLayoutEffect from '../hooks/useIsomorphicLayoutEffect';
import ListContent from '../ListContent';

const defaultPlayerProps = {
  ...Pad.defaultProps,
  direction: 'x',
  autoplayEnabled: true,
  autoplayInterval: 5000,
  loop: true,
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
    onDragStart = defaultPlayerProps.onDragStart,
    onDragEnd = defaultPlayerProps.onDragEnd,
    onDecelerationStart = defaultPlayerProps.onDecelerationStart,
    onDecelerationEnd = defaultPlayerProps.onDecelerationEnd,
    onMouseEnter = defaultPlayerProps.onMouseEnter,
    onMouseLeave = defaultPlayerProps.onMouseLeave,
    onScroll = defaultPlayerProps.onScroll,
    onContentResize = defaultPlayerProps.onContentResize,
  } = padProps;
  const [mouseEntered, setMouseEntered] = useState(false);
  const [loopCount, setLoopCount] = useState(1);
  const [loopOffset, setLoopOffset] = useState(0);
  const [scrollTo, setScrollTo] = useState(null);
  const [relativeOffset, setRelativeOffset] = useState(null);
  const playerRef = useRef({ padState: null, autoplayTimer: null });

  const go = useCallback(({ delta, animated }) => {
    setRelativeOffset({ delta, animated });
  }, []);

  const rewind = useCallback(() => {
    setRelativeOffset({ delta: -1, animated: true });
  }, []);

  const forward = useCallback(() => {
    setRelativeOffset({ delta: 1, animated: true });
  }, []);

  const startPlaying = useCallback(() => {
    const padState = playerRef.current.padState;
    const autoplayTimer = playerRef.current.autoplayTimer;
    if (padState.drag || padState.deceleration) {
      return;
    }
    if (mouseEntered) {
      return;
    }

    if (autoplayTimer) {
      clearTimeout(autoplayTimer);
    }

    playerRef.current.autoplayTimer = setTimeout(() => {
      playerRef.current.autoplayTimer = undefined;
      forward();
    }, autoplayInterval);
  }, [mouseEntered, autoplayInterval, forward]);

  const stopPlaying = useCallback(() => {
    const autoplayTimer = playerRef.current.autoplayTimer;
    if (autoplayTimer) {
      clearTimeout(autoplayTimer);
      playerRef.current.autoplayTimer = undefined;
    }
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (autoplayEnabled) {
      startPlaying();
    } else {
      stopPlaying();
    }

    return () => stopPlaying();
  }, [autoplayEnabled, autoplayInterval, startPlaying, stopPlaying]);

  useMemo(() => {
    if (!loop && loopCount !== 1) {
      setLoopCount(1);
      setLoopOffset(0);
    }
  }, [loop, loopCount]);

  useMemo(() => {
    if (!relativeOffset) {
      return;
    }

    const { delta, animated } = relativeOffset;
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
  }, [relativeOffset, loopCount, direction]);

  const onPadDragStart = useCallback(
    evt => {
      stopPlaying();
      onDragStart(evt);
    },
    [onDragStart, stopPlaying]
  );

  const onPadDragEnd = useCallback(
    evt => {
      startPlaying();
      onDragEnd(evt);
    },
    [onDragEnd, startPlaying]
  );

  const onPadDecelerationStart = useCallback(
    evt => {
      stopPlaying();
      onDecelerationStart(evt);
    },
    [onDecelerationStart, stopPlaying]
  );

  const onPadDecelerationEnd = useCallback(
    evt => {
      startPlaying();
      onDecelerationEnd(evt);
    },
    [onDecelerationEnd, startPlaying]
  );

  const onPadMouseEnter = useCallback(
    evt => {
      setMouseEntered(true);
      stopPlaying();

      if (onMouseEnter) {
        onMouseEnter(evt);
      }
    },
    [onMouseEnter, stopPlaying]
  );

  const onPadMouseLeave = useCallback(
    evt => {
      setMouseEntered(false);
      startPlaying();

      if (onMouseLeave) {
        onMouseLeave(evt);
      }
    },
    [onMouseLeave, startPlaying]
  );

  const onPadScroll = useCallback(
    evt => {
      const padState = playerRef.current.padState;
      const { contentOffset, size, contentSize } = padState;
      const [adjustedContentOffset, delta] = getAdjustedContentOffsetForLoop(
        contentOffset,
        size,
        contentSize,
        loopCount,
        direction
      );

      if (contentOffset !== adjustedContentOffset) {
        setScrollTo({ offset: adjustedContentOffset, animated: false });
        setLoopOffset(loopOffset + delta);
      }

      onScroll(evt);
    },
    [loopCount, loopOffset, direction, onScroll]
  );

  const onPadContentResize = useCallback(
    contentSize => {
      const padState = playerRef.current.padState;
      const { contentOffset, size } = padState;

      let nextLoopCount = calculateLoopCount(
        size,
        contentSize,
        loopCount,
        direction
      );

      if (nextLoopCount !== loopCount) {
        setLoopCount(nextLoopCount);
        setLoopOffset(0);
      } else {
        const [adjustedContentOffset, delta] = getAdjustedContentOffsetForLoop(
          contentOffset,
          size,
          contentSize,
          nextLoopCount,
          direction
        );

        if (contentOffset !== adjustedContentOffset) {
          setScrollTo({ offset: adjustedContentOffset, animated: false });
          setLoopOffset(loopOffset + delta);
        }
      }

      onContentResize(contentSize);
    },
    [loopCount, loopOffset, direction, onContentResize]
  );

  if (direction === 'x') {
    padProps.alwaysBounceY = false;
  } else {
    padProps.alwaysBounceX = false;
  }

  if (loop) {
    padProps.onScroll = onPadScroll;
    padProps.onContentResize = onPadContentResize;
  }

  if (autoplayEnabled) {
    padProps.onDragStart = onPadDragStart;
    padProps.onDragEnd = onPadDragEnd;
    padProps.onDecelerationStart = onPadDecelerationStart;
    padProps.onDecelerationEnd = onPadDecelerationEnd;
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
        playerRef.current.padState = padState;

        return (
          <ListContent
            direction={direction}
            itemCount={loopCount}
            renderItem={({ Item, itemIndex }) => (
              <Item key={itemIndex + 2} hash="loop">
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
