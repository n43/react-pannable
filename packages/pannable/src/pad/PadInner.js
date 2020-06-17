import React, { useEffect, useMemo, useReducer, useCallback } from 'react';
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

const overlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
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

  const onResize = useCallback(contentSize => {
    dispatch({ type: 'syncProps', props: { contentSize } });
  }, []);

  const _scrollTo = useCallback(value => {
    dispatch({ type: 'scrollTo', value });
  }, []);

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
      console.log('onContentResize');
      onContentResize(state.contentSize);
    }

    const input = {
      size: state.size,
      contentSize: state.contentSize,
      contentOffset: state.contentOffset,
      contentVelocity: state.contentVelocity,
      dragging: !!state.drag,
      decelerating: !!state.deceleration,
    };

    if (prevState.contentOffset !== state.contentOffset) {
      onScroll(input);
    }
    if (prevState.drag !== state.drag) {
      if (!prevState.drag) {
        onDragStart(input);
      } else if (!state.drag) {
        onDragEnd(input);
      }
    }
    if (prevState.deceleration !== state.deceleration) {
      if (!prevState.deceleration) {
        onDecelerationStart(input);
      } else if (!state.deceleration) {
        onDecelerationEnd(input);
      }
    }
  });

  useIsomorphicLayoutEffect(() => {
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
    console.log('scrollTo');
    if (scrollTo) {
      _scrollTo(scrollTo);
    }
  }, [scrollTo, _scrollTo]);

  const methods = { _scrollTo };

  let backgroundLayer = renderBackground(state, methods);

  if (backgroundLayer !== null) {
    backgroundLayer = <div style={backgroundStyle}>{backgroundLayer}</div>;
  }

  let overlayLayer = renderOverlay(state, methods);

  if (overlayLayer !== null) {
    overlayLayer = <div style={overlayStyle}>{overlayLayer}</div>;
  }

  let contentLayer =
    typeof children === 'function' ? children(state, methods) : children;

  const contentStyle = StyleSheet.create({
    position: 'absolute',
    overflow: 'hidden',
    width: state.contentSize.width,
    height: state.contentSize.height,
    transformTranslate: state.contentOffset,
    willChange: 'transform',
  });

  const contextValue = useMemo(
    () => ({
      visibleRect: {
        x: -state.contentOffset.x,
        y: -state.contentOffset.y,
        width: state.size.width,
        height: state.size.height,
      },
      onResize,
    }),
    [state.contentOffset, state.size, onResize]
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
