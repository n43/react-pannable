import React, {
  isValidElement,
  cloneElement,
  useCallback,
  useRef,
} from 'react';
import usePadReducer from './usePadReducer';
import Pannable from './Pannable';
import PadContext from './PadContext';
import GeneralContent from './GeneralContent';
import useIsomorphicLayoutEffect from './hooks/useIsomorphicLayoutEffect';
import usePrevRef from './hooks/usePrevRef';
import StyleSheet from './utils/StyleSheet';
import {
  requestAnimationFrame,
  cancelAnimationFrame,
} from './utils/animationFrame';
import { shouldDragStart, calculateRectOffset } from './utils/motion';

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
  ...Pannable.defaultProps,
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
    enabled = defaultPadProps.enabled,
    shouldStart = defaultPadProps.shouldStart,
    onStart = defaultPadProps.onStart,
    onMove = defaultPadProps.onMove,
    onEnd = defaultPadProps.onEnd,
    onCancel = defaultPadProps.onCancel,
  } = pannableProps;
  const [state, dispatch] = usePadReducer();
  const prevStateRef = usePrevRef(state);
  const propsRef = useRef(defaultPadProps);

  const prevProps = propsRef.current;
  propsRef.current = {
    width,
    height,
    pagingEnabled,
    directionalLockEnabled,
    alwaysBounceX,
    alwaysBounceY,
    scrollTo,
    scrollToRect,
    onScroll,
    onDragStart,
    onDragEnd,
    onDecelerationStart,
    onDecelerationEnd,
    onContentResize,
    enabled,
    shouldStart,
    onStart,
    onMove,
    onEnd,
    onCancel,
  };
  const {
    size,
    contentSize,
    contentOffset,
    contentVelocity,
    drag,
    deceleration,
  } = state;

  const resizeContent = useCallback(
    size => dispatch({ type: 'setContentSize', props: propsRef.current, size }),
    [dispatch]
  );

  const shouldPannableStart = useCallback(
    evt => {
      if (
        propsRef.current.directionalLockEnabled &&
        !shouldDragStart(evt.velocity, size, contentSize)
      ) {
        return false;
      }

      return propsRef.current.shouldStart(evt);
    },
    [size, contentSize]
  );

  const onPannableStart = useCallback(
    evt => {
      dispatch({
        type: 'dragStart',
        props: propsRef.current,
        velocity: evt.velocity,
      });
      propsRef.current.onStart(evt);
    },
    [dispatch]
  );

  const onPannableMove = useCallback(
    evt => {
      dispatch({
        type: 'dragMove',
        props: propsRef.current,
        translation: evt.translation,
        interval: evt.interval,
      });
      propsRef.current.onMove(evt);
    },
    [dispatch]
  );

  const onPannableEnd = useCallback(
    evt => {
      dispatch({ type: 'dragEnd', props: propsRef.current });
      propsRef.current.onEnd(evt);
    },
    [dispatch]
  );

  const onPannableCancel = useCallback(
    evt => {
      dispatch({ type: 'dragCancel', props: propsRef.current });
      propsRef.current.onCancel(evt);
    },
    [dispatch]
  );

  useIsomorphicLayoutEffect(() => {
    const prevState = prevStateRef.current;
    const output = {
      size,
      contentSize,
      contentOffset,
      contentVelocity,
      dragging: !!drag,
      decelerating: !!deceleration,
    };

    if (contentSize !== prevState.contentSize) {
      onContentResize(contentSize);
    }
    if (contentOffset !== prevState.contentOffset) {
      onScroll(output);
    }
    if (drag !== prevState.drag) {
      if (!prevState.drag) {
        onDragStart(output);
      } else if (!drag) {
        onDragEnd(output);
      }
    }
    if (deceleration !== prevState.deceleration) {
      if (!prevState.deceleration) {
        onDecelerationStart(output);
      } else if (!deceleration) {
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
      dispatch({
        type: 'decelerate',
        props: propsRef.current,
        now: new Date().getTime(),
      });
    });

    return () => {
      if (timer) {
        cancelAnimationFrame(timer);
      }
    };
  }, [state, dispatch]);

  const visibleRect = {
    x: -contentOffset.x,
    y: -contentOffset.y,
    width: size.width,
    height: size.height,
  };

  if (width !== prevProps.width || height !== prevProps.height) {
    dispatch({ type: 'setSize', props: propsRef.current });
  }
  if (scrollTo !== prevProps.scrollTo) {
    if (scrollTo) {
      const { offset, animated } = scrollTo;

      dispatch({
        type: 'setContentOffset',
        props: propsRef.current,
        offset,
        animated,
      });
    }
  }
  if (scrollToRect !== prevProps.scrollToRect) {
    if (scrollToRect) {
      const { rect, align, animated } = scrollToRect;
      const offset = calculateRectOffset(rect, visibleRect, align);

      dispatch({
        type: 'setContentOffset',
        props: propsRef.current,
        offset,
        animated,
      });
    }
  }
  if (pagingEnabled !== prevProps.pagingEnabled) {
    if (pagingEnabled) {
      dispatch({ type: 'validate', props: propsRef.current });
    }
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
    transformTranslate: [contentOffset.x, contentOffset.y],
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
