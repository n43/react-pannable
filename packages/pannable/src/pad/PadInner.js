import React, { useEffect, useMemo, useReducer, useRef } from 'react';
import { reducer, initialPadState } from './padReducer';
import PadContext from './PadContext';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
import { usePrevRef } from '../hooks/usePrevRef';
import {
  requestAnimationFrame,
  cancelAnimationFrame,
} from '../utils/animationFrame';
import StyleSheet from '../utils/StyleSheet';

const backgroundStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

function PadInner(props) {
  const {
    pannable,
    size,
    pagingEnabled,
    directionalLockEnabled,
    alwaysBounce,
    isBoundless,
    onScroll,
    onDragStart,
    onDragEnd,
    onDecelerationStart,
    onDecelerationEnd,
    onContentResize,
    renderBackground,
    renderOverlay,
    scrollTo,
    children,
  } = props;
  const [state, dispatch] = useReducer(reducer, initialPadState);
  const prevStateRef = usePrevRef(state);
  const prevState = prevStateRef.current;
  const methodsRef = useRef({
    _scrollTo(value) {
      dispatch({ type: 'scrollTo', value });
    },
  });
  const responseRef = useRef({
    onPadContentResize(contentSize) {
      dispatch({ type: 'syncProps', props: { contentSize } });
    },
  });

  responseRef.current.onScroll = onScroll;
  responseRef.current.onDragStart = onDragStart;
  responseRef.current.onDragEnd = onDragEnd;
  responseRef.current.onDecelerationStart = onDecelerationStart;
  responseRef.current.onDecelerationEnd = onDecelerationEnd;
  responseRef.current.onContentResize = onContentResize;

  useMemo(() => {
    dispatch({
      type: 'syncProps',
      props: {
        size,
        pannable,
        alwaysBounce,
        isBoundless,
        pagingEnabled,
        directionalLockEnabled,
      },
    });
  }, [
    size,
    pannable,
    alwaysBounce,
    isBoundless,
    pagingEnabled,
    directionalLockEnabled,
  ]);

  useIsomorphicLayoutEffect(() => {
    if (prevState.pannable.translation !== state.pannable.translation) {
      if (state.pannable.translation) {
        if (prevState.pannable.translation) {
          dispatch({ type: 'dragMove' });
        } else {
          dispatch({ type: 'dragStart' });
        }
      } else {
        if (state.pannable.enabled) {
          dispatch({ type: 'dragEnd' });
        } else {
          dispatch({ type: 'dragCancel' });
        }
      }
    }

    if (prevState.contentSize !== state.contentSize) {
      responseRef.current.onContentResize(state.contentSize);
    }

    const output = {
      size: state.size,
      contentSize: state.contentSize,
      contentOffset: state.contentOffset,
      contentVelocity: state.contentVelocity,
      dragging: !!state.drag,
      decelerating: !!state.deceleration,
    };

    if (prevState.contentOffset !== state.contentOffset) {
      responseRef.current.onScroll(output);
    }
    if (prevState.drag !== state.drag) {
      if (!prevState.drag) {
        responseRef.current.onDragStart(output);
      } else if (!state.drag) {
        responseRef.current.onDragEnd(output);
      }
    }
    if (prevState.deceleration !== state.deceleration) {
      if (!prevState.deceleration) {
        responseRef.current.onDecelerationStart(output);
      } else if (!state.deceleration) {
        responseRef.current.onDecelerationEnd(output);
      }
    }

    if (!state.deceleration) {
      return;
    }

    const timer = requestAnimationFrame(() => {
      dispatch({ type: 'decelerate' });
    });

    return () => {
      cancelAnimationFrame(timer);
    };
  }, [state]);

  useEffect(() => {
    if (scrollTo) {
      methodsRef.current._scrollTo(scrollTo);
    }
  }, [scrollTo]);

  let backgroundLayer = renderBackground(state, methodsRef.current);

  if (backgroundLayer !== null) {
    backgroundLayer = <div style={backgroundStyle}>{backgroundLayer}</div>;
  }

  let overlayLayer = renderOverlay(state, methodsRef.current);

  let contentLayer =
    typeof children === 'function'
      ? children(state, methodsRef.current)
      : children;

  const contentStyle = useMemo(
    () =>
      StyleSheet.create({
        position: 'absolute',
        overflow: 'hidden',
        willChange: 'transform',
        transformTranslate: state.contentOffset,
        width: state.contentSize.width,
        height: state.contentSize.height,
      }),
    [state.contentSize, state.contentOffset]
  );

  const contextValue = useMemo(
    () => ({
      visibleRect: {
        x: -state.contentOffset.x,
        y: -state.contentOffset.y,
        width: state.size.width,
        height: state.size.height,
      },
      onResize: responseRef.current.onPadContentResize,
    }),
    [state.contentOffset, state.size]
  );

  return (
    <>
      {backgroundLayer}
      <div style={contentStyle}>
        <PadContext.Provider value={contextValue}>
          {contentLayer}
        </PadContext.Provider>
      </div>
      {overlayLayer}
    </>
  );
}

export default PadInner;
