import React, {
  isValidElement,
  cloneElement,
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import usePadReducer from './usePadReducer';
import Pannable from './Pannable';
import PadContext from './PadContext';
import GeneralContent from './GeneralContent';
import useIsomorphicLayoutEffect from './utils/useIsomorphicLayoutEffect';
import StyleSheet from './utils/StyleSheet';
import {
  requestAnimationFrame,
  cancelAnimationFrame,
} from './utils/animationFrame';
import { shouldDragStart, calculateRectOffset } from './utils/motion';

const defaultPannableProps = Pannable.defaultProps;

const defaultPadProps = {
  width: 0,
  height: 0,
  pagingEnabled: false,
  directionalLockEnabled: false,
  alwaysBounceX: true,
  alwaysBounceY: true,
  scrollTo: null,
  scrollToRect: null,
  onScroll: () => {},
  onDragStart: () => {},
  onDragEnd: () => {},
  onDecelerationStart: () => {},
  onDecelerationEnd: () => {},
  onContentResize: () => {},
};

function Pad({
  width = defaultPadProps.width,
  height = defaultPadProps.height,
  pagingEnabled = defaultPadProps.pagingEnabled,
  directionalLockEnabled = defaultPadProps.directionalLockEnabled,
  alwaysBounceX = defaultPadProps.alwaysBounceX,
  alwaysBounceY = defaultPadProps.alwaysBounceY,
  scrollTo = defaultPadProps.scrollTo,
  scrollToRect = defaultPadProps.scrollToRect,
  onScroll = defaultPadProps.onScroll,
  onDragStart = defaultPadProps.onDragStart,
  onDragEnd = defaultPadProps.onDragEnd,
  onDecelerationStart = defaultPadProps.onDecelerationStart,
  onDecelerationEnd = defaultPadProps.onDecelerationEnd,
  onContentResize = defaultPadProps.onContentResize,
  ...pannableProps
}) {
  const {
    shouldStart = defaultPannableProps.shouldStart,
    onStart = defaultPannableProps.onStart,
    onMove = defaultPannableProps.onMove,
    onEnd = defaultPannableProps.onEnd,
    onCancel = defaultPannableProps.onCancel,
  } = pannableProps;
  const size = useMemo(() => ({ width, height }), [width, height]);
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 });
  const [state, dispatch] = usePadReducer();
  const eventRef = useRef({ contentSize, state });

  const {
    pagingEnabled: prevPagingEnabled,
    scrollTo: prevScrollTo,
    scrollToRect: prevScrollToRect,
    size: prevSize,
  } = eventRef.current;

  eventRef.current.pagingEnabled = pagingEnabled;
  eventRef.current.scrollTo = scrollTo;
  eventRef.current.scrollToRect = scrollToRect;
  eventRef.current.size = size;
  eventRef.current.onScroll = onScroll;
  eventRef.current.onDragStart = onDragStart;
  eventRef.current.onDragEnd = onDragEnd;
  eventRef.current.onDecelerationStart = onDecelerationStart;
  eventRef.current.onDecelerationEnd = onDecelerationEnd;
  eventRef.current.onContentResize = onContentResize;
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
      dispatch({ type: 'dragEnd', pagingEnabled, size });
      eventRef.current.onEnd(evt);
    },
    [pagingEnabled, size, dispatch]
  );

  const onPannableCancel = useCallback(
    evt => {
      dispatch({ type: 'dragCancel', pagingEnabled, size });
      eventRef.current.onCancel(evt);
    },
    [pagingEnabled, size, dispatch]
  );

  useIsomorphicLayoutEffect(() => {
    const {
      state: prevState,
      contentSize: prevContentSize,
      onScroll,
      onDragStart,
      onDragEnd,
      onDecelerationStart,
      onDecelerationEnd,
      onContentResize,
    } = eventRef.current;
    const output = {
      size,
      contentSize,
      contentOffset: state.contentOffset,
      contentVelocity: state.contentVelocity,
      dragging: !!state.drag,
      decelerating: !!state.deceleration,
    };

    eventRef.current.contentSize = contentSize;
    eventRef.current.state = state;

    if (contentSize !== prevContentSize) {
      onContentResize(contentSize);
      dispatch({ type: 'validate', size, contentSize, pagingEnabled });
    }
    if (state !== prevState) {
      onScroll(output);
      dispatch({ type: 'validate', size, contentSize, pagingEnabled });
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

  useIsomorphicLayoutEffect(() => {
    if (!state.deceleration) {
      return;
    }

    let timer = requestAnimationFrame(() => {
      timer = undefined;
      dispatch({ type: 'decelerate', now: new Date().getTime() });
    });

    return () => {
      if (timer) {
        cancelAnimationFrame(timer);
      }
    };
  }, [state, dispatch]);

  const visibleRect = {
    x: -state.contentOffset.x,
    y: -state.contentOffset.y,
    width: size.width,
    height: size.height,
  };

  if (scrollTo !== prevScrollTo) {
    if (scrollTo) {
      dispatch({ type: 'setContentOffset', ...scrollTo });
    }
  } else if (scrollToRect !== prevScrollToRect) {
    if (scrollToRect) {
      const offset = calculateRectOffset(
        scrollToRect.rect,
        visibleRect,
        scrollToRect.align
      );

      dispatch({
        type: 'setContentOffset',
        offset,
        animated: scrollToRect.animated,
      });
    }
  } else if (pagingEnabled !== prevPagingEnabled || size !== prevSize) {
    dispatch({ type: 'validate', size, contentSize, pagingEnabled });
  }

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

  pannableProps.style = { ...elemStyle, ...pannableProps.style };

  let element = pannableProps.children;

  if (isValidElement(element) && element.type.PadContent) {
    element = cloneElement(element, {
      style: { ...contentStyle, ...element.props.style },
      ref: element.ref,
    });
  } else {
    element = <GeneralContent style={contentStyle}>{element}</GeneralContent>;
  }

  return (
    <PadContext.Provider value={{ visibleRect, resizeContent }}>
      <Pannable {...pannableProps}>{element}</Pannable>
    </PadContext.Provider>
  );
}

Pad.defaultProps = defaultPadProps;

export default Pad;
