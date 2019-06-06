import React, {
  isValidElement,
  cloneElement,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  useReducer,
} from 'react';
import { usePannable, defaultPannableProps } from './usePannable';
import PadContext from './PadContext';
import GeneralContent from './GeneralContent';
import StyleSheet from './utils/StyleSheet';
import {
  requestAnimationFrame,
  cancelAnimationFrame,
} from './utils/animationFrame';
import {
  getAdjustedContentVelocity,
  getAdjustedContentOffset,
  getAdjustedBounceOffset,
  getDecelerationEndOffset,
  shouldDragStart,
  createDeceleration,
  calculateDeceleration,
  calculateRectOffset,
} from './utils/motion';

const DECELERATION_RATE_STRONG = 0.025;
const DECELERATION_RATE_WEAK = 0.0025;

const initialState = {
  contentOffset: { x: 0, y: 0 },
  contentVelocity: { x: 0, y: 0 },
  drag: null,
  deceleration: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'render':
      return renderReducer(state, action);
    case 'dragStart':
      return dragStartReducer(state, action);
    case 'dragMove':
      return dragMoveReducer(state, action);
    case 'dragEnd':
      return dragEndReducer(state, action);
    case 'dragCancel':
      return dragCancelReducer(state, action);
    case 'decelerate':
      return decelerateReducer(state, action);
    default:
      return state;
  }
}

function renderReducer(state, action) {
  const { contentOffset, contentVelocity, drag, deceleration } = state;
  const { size, contentSize, pagingEnabled } = action;

  const decelerationRate = DECELERATION_RATE_STRONG;

  if (deceleration) {
    let decelerationEndOffset = deceleration.endOffset;

    if (
      decelerationEndOffset !==
        getAdjustedContentOffset(
          decelerationEndOffset,
          size,
          contentSize,
          pagingEnabled,
          true
        ) &&
      contentOffset !==
        getAdjustedContentOffset(
          contentOffset,
          size,
          contentSize,
          pagingEnabled,
          true
        )
    ) {
      let nextContentVelocity = contentVelocity;

      if (deceleration.rate !== decelerationRate) {
        nextContentVelocity = getAdjustedContentVelocity(
          nextContentVelocity,
          size,
          decelerationRate
        );
        decelerationEndOffset = getDecelerationEndOffset(
          contentOffset,
          nextContentVelocity,
          size,
          pagingEnabled,
          decelerationRate
        );
      }

      decelerationEndOffset = getAdjustedContentOffset(
        decelerationEndOffset,
        size,
        contentSize,
        pagingEnabled,
        true
      );

      return {
        contentOffset: { ...contentOffset },
        contentVelocity: nextContentVelocity,
        drag: null,
        deceleration: createDeceleration(
          contentOffset,
          nextContentVelocity,
          decelerationEndOffset,
          decelerationRate
        ),
      };
    }
  } else if (!drag) {
    const adjustedContentOffset = getAdjustedContentOffset(
      contentOffset,
      size,
      contentSize,
      pagingEnabled
    );

    if (contentOffset !== adjustedContentOffset) {
      const decelerationEndOffset = getDecelerationEndOffset(
        adjustedContentOffset,
        { x: 0, y: 0 },
        size,
        pagingEnabled,
        decelerationRate
      );

      return {
        contentOffset: { ...contentOffset },
        contentVelocity,
        drag: null,
        deceleration: createDeceleration(
          contentOffset,
          contentVelocity,
          decelerationEndOffset,
          decelerationRate
        ),
      };
    }
  }

  return state;
}

function dragStartReducer(state, action) {
  const { contentOffset } = state;
  const { directionalLockEnabled, velocity } = action;

  const dragDirection = { x: 1, y: 1 };

  if (directionalLockEnabled) {
    if (Math.abs(velocity.x) > Math.abs(velocity.y)) {
      dragDirection.y = 0;
    } else {
      dragDirection.x = 0;
    }
  }

  const nextContentVelocity = {
    x: dragDirection.x * velocity.x,
    y: dragDirection.y * velocity.y,
  };

  return {
    contentOffset: { ...contentOffset },
    contentVelocity: nextContentVelocity,
    drag: { direction: dragDirection, startOffset: contentOffset },
    deceleration: null,
  };
}

function dragMoveReducer(state, action) {
  const { contentOffset, drag } = state;
  const {
    alwaysBounceX,
    alwaysBounceY,
    size,
    contentSize,
    translation,
    interval,
  } = action;

  const nextContentOffset = getAdjustedBounceOffset(
    {
      x: drag.startOffset.x + drag.direction.x * translation.x,
      y: drag.startOffset.y + drag.direction.y * translation.y,
    },
    { x: alwaysBounceX, y: alwaysBounceY },
    size,
    contentSize
  );
  const nextContentVelocity = {
    x: (nextContentOffset.x - contentOffset.x) / interval,
    y: (nextContentOffset.y - contentOffset.y) / interval,
  };

  return {
    contentOffset: nextContentOffset,
    contentVelocity: nextContentVelocity,
    drag,
    deceleration: null,
  };
}

function dragEndReducer(state, action) {
  const { contentOffset, contentVelocity } = state;
  const { pagingEnabled, size } = action;

  let decelerationRate = DECELERATION_RATE_WEAK;
  let nextContentVelocity = contentVelocity;

  if (pagingEnabled) {
    decelerationRate = DECELERATION_RATE_STRONG;
    nextContentVelocity = getAdjustedContentVelocity(
      nextContentVelocity,
      size,
      decelerationRate
    );
  }

  const decelerationEndOffset = getDecelerationEndOffset(
    contentOffset,
    nextContentVelocity,
    size,
    pagingEnabled,
    decelerationRate
  );

  return {
    contentOffset: { ...contentOffset },
    contentVelocity: nextContentVelocity,
    drag: null,
    deceleration: createDeceleration(
      contentOffset,
      nextContentVelocity,
      decelerationEndOffset,
      decelerationRate
    ),
  };
}

function dragCancelReducer(state, action) {
  const { contentOffset, contentVelocity, drag } = state;
  const { pagingEnabled, size } = action;

  const decelerationRate = DECELERATION_RATE_STRONG;
  const decelerationEndOffset = getDecelerationEndOffset(
    drag.startOffset,
    { x: 0, y: 0 },
    size,
    pagingEnabled,
    decelerationRate
  );

  return {
    contentOffset: { ...contentOffset },
    contentVelocity,
    drag: null,
    deceleration: createDeceleration(
      contentOffset,
      contentVelocity,
      decelerationEndOffset,
      decelerationRate
    ),
  };
}

function decelerateReducer(state, action) {
  const { deceleration } = state;
  const { now: moveTime } = action;

  if (!deceleration) {
    return state;
  }
  if (deceleration.startTime + deceleration.duration <= moveTime) {
    return {
      contentOffset: deceleration.endOffset,
      contentVelocity: { x: 0, y: 0 },
      drag: null,
      deceleration: null,
    };
  }

  const { xOffset, yOffset, xVelocity, yVelocity } = calculateDeceleration(
    deceleration,
    moveTime
  );

  return {
    contentOffset: { x: xOffset, y: yOffset },
    contentVelocity: { x: xVelocity, y: yVelocity },
    drag: null,
    deceleration,
  };
}

export const defaultPadProps = {
  width: 0,
  height: 0,
  pagingEnabled: false,
  directionalLockEnabled: false,
  alwaysBounceX: true,
  alwaysBounceY: true,
  onScroll: () => {},
  onDragStart: () => {},
  onDragEnd: () => {},
  onDecelerationStart: () => {},
  onDecelerationEnd: () => {},
  onContentResize: () => {},
};

export function usePad({
  width = defaultPadProps.width,
  height = defaultPadProps.height,
  pagingEnabled = defaultPadProps.pagingEnabled,
  directionalLockEnabled = defaultPadProps.directionalLockEnabled,
  alwaysBounceX = defaultPadProps.alwaysBounceX,
  alwaysBounceY = defaultPadProps.alwaysBounceY,
  onScroll = defaultPadProps.onScroll,
  onDragStart = defaultPadProps.onDragStart,
  onDragEnd = defaultPadProps.onDragEnd,
  onDecelerationStart = defaultPadProps.onDecelerationStart,
  onDecelerationEnd = defaultPadProps.onDecelerationEnd,
  onContentResize = defaultPadProps.onContentResize,
  ...pannableProps
}) {
  const size = useMemo(() => ({ width, height }), [width, height]);
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 });
  const [state, dispatch] = useReducer(reducer, initialState);
  const eventRef = useRef({ state, contentSize });

  const {
    shouldStart = defaultPannableProps.shouldStart,
    onStart = defaultPannableProps.onStart,
    onMove = defaultPannableProps.onMove,
    onEnd = defaultPannableProps.onEnd,
    onCancel = defaultPannableProps.onCancel,
  } = pannableProps;

  eventRef.current.shouldStart = shouldStart;
  eventRef.current.onStart = onStart;
  eventRef.current.onMove = onMove;
  eventRef.current.onEnd = onEnd;
  eventRef.current.onCancel = onCancel;

  const resizeContent = useCallback(size => setContentSize(size), []);
  const shouldPannableStart = useCallback(
    evt => {
      const { velocity } = evt;

      if (
        directionalLockEnabled &&
        !shouldDragStart(velocity, size, contentSize)
      ) {
        return false;
      }

      return eventRef.current.shouldStart(evt);
    },
    [directionalLockEnabled, size, contentSize]
  );

  const onPannableStart = useCallback(
    evt => {
      // console.log('dispatch', 'dragStart');
      dispatch({
        type: 'dragStart',
        directionalLockEnabled,
        velocity: evt.velocity,
      });
      eventRef.current.onStart(evt);
    },
    [directionalLockEnabled, dispatch]
  );

  const onPannableMove = useCallback(
    evt => {
      // console.log('dispatch', 'dragMove');
      dispatch({
        type: 'dragMove',
        alwaysBounceX,
        alwaysBounceY,
        size,
        contentSize,
        translation: evt.translation,
        interval: evt.interval,
      });
      eventRef.current.onMove(evt);
    },
    [alwaysBounceX, alwaysBounceY, size, contentSize, dispatch]
  );

  const onPannableEnd = useCallback(
    evt => {
      // console.log('dispatch', 'dragEnd');
      dispatch({ type: 'dragEnd', pagingEnabled, size });
      eventRef.current.onEnd(evt);
    },
    [pagingEnabled, size, dispatch]
  );

  const onPannableCancel = useCallback(
    evt => {
      // console.log('dispatch', 'dragCancel');
      dispatch({ type: 'dragCancel', pagingEnabled, size });
      eventRef.current.onCancel(evt);
    },
    [pagingEnabled, size, dispatch]
  );

  const decelerate = useCallback(() => {
    // console.log('dispatch', 'decelerate');
    dispatch({ type: 'decelerate', now: new Date().getTime() });
  }, [dispatch]);

  useEffect(() => {
    const { state: prevState, contentSize: prevContentSize } = eventRef.current;
    const output = {
      size,
      contentSize,
      contentOffset: state.contentOffset,
      contentVelocity: state.contentVelocity,
      dragging: !!state.drag,
      decelerating: !!state.deceleration,
    };

    eventRef.current.state = state;
    eventRef.current.contentSize = contentSize;

    // console.log('effect1', state === prevState);
    if (contentSize !== prevContentSize) {
      onContentResize(contentSize);
    }
    if (state.contentOffset !== prevState.contentOffset) {
      // console.log('onScroll', state.contentOffset);
      onScroll(output);
    }
    if (state.drag !== prevState.drag) {
      if (!prevState.drag) {
        onDragStart(output);
      } else if (!state.drag) {
        onDragEnd(output);
      }
    }
    if (state.deceleration !== prevState.deceleration) {
      if (!prevState.deceleration) {
        onDecelerationStart(output);
      } else if (!state.deceleration) {
        onDecelerationEnd(output);
      }
    }
  });

  useEffect(() => {
    if (state.deceleration) {
      const timer = requestAnimationFrame(() => decelerate());

      return () => cancelAnimationFrame(timer);
    }
  }, [state, decelerate]);

  useMemo(() => {
    if (!state.drag) {
      // console.log('dispatch', 'render');
      dispatch({ type: 'render', size, contentSize, pagingEnabled });
    }
  }, [size, contentSize, pagingEnabled, state, dispatch]);

  const elemStyle = {
    overflow: 'hidden',
    position: 'relative',
    width: size.width,
    height: size.height,
  };

  const contentStyle = StyleSheet.create({
    position: 'relative',
    width: contentSize.width,
    height: contentSize.height,
    transformTranslate: [state.contentOffset.x, state.contentOffset.y],
    willChange: 'transform',
  });

  pannableProps.shouldStart = shouldPannableStart;
  pannableProps.onStart = onPannableStart;
  pannableProps.onMove = onPannableMove;
  pannableProps.onEnd = onPannableEnd;
  pannableProps.onCancel = onPannableCancel;

  const visibleRect = {
    x: -state.contentOffset.x,
    y: -state.contentOffset.y,
    width: size.width,
    height: size.height,
  };
  const [props] = usePannable(pannableProps);

  props.style = { ...elemStyle, ...props.style };
  props.render = children => {
    if (isValidElement(children) && children.type.PadContent) {
      children = cloneElement(children, {
        style: { ...contentStyle, ...children.props.style },
        ref: children.ref,
      });
    } else {
      children = (
        <GeneralContent style={contentStyle}>{children}</GeneralContent>
      );
    }

    return (
      <PadContext.Provider
        value={{ visibleRect, onContentResize: resizeContent }}
      >
        {children}
      </PadContext.Provider>
    );
  };

  return [props];
}
