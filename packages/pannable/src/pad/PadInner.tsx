import PadContext from './PadContext';
import reducer, {
  initialPadState,
  PadState,
  PadEvent,
  PadMethods,
} from './padReducer';
import { PannableState } from '../pannableReducer';
import { XY, Size, Bound, Inset } from '../interfaces';
import {
  requestAnimationFrame,
  cancelAnimationFrame,
} from '../utils/animationFrame';
import StyleSheet from '../utils/StyleSheet';
import { useIsomorphicLayoutEffect } from '../utils/hooks';
import React, { useMemo, useReducer, useRef, useCallback } from 'react';

export interface PadInnerProps {
  pannable: PannableState;
  size: Size;
  bound: Record<XY, Bound>;
  contentInset: Inset;
  pagingEnabled: boolean;
  directionalLockEnabled: boolean;
  onScroll?: (evt: PadEvent) => void;
  onStartDragging?: (evt: PadEvent) => void;
  onEndDragging?: (evt: PadEvent) => void;
  onStartDecelerating?: (evt: PadEvent) => void;
  onEndDecelerating?: (evt: PadEvent) => void;
  onResizeContent?: (evt: Size) => void;
  renderBackground?: (state: PadState, methods: PadMethods) => React.ReactNode;
  renderOverlay?: (state: PadState, methods: PadMethods) => React.ReactNode;
  render: (state: PadState, methods: PadMethods) => React.ReactNode;
}

export const PadInner = React.memo<PadInnerProps>((props) => {
  const {
    pannable,
    size,
    bound,
    contentInset,
    pagingEnabled,
    directionalLockEnabled,
    onScroll,
    onStartDragging,
    onEndDragging,
    onStartDecelerating,
    onEndDecelerating,
    onResizeContent,
    renderBackground,
    renderOverlay,
    render,
  } = props;
  const [state, dispatch] = useReducer(reducer, initialPadState);
  const prevStateRef = useRef(state);
  const delegate = {
    onScroll,
    onStartDragging,
    onEndDragging,
    onStartDecelerating,
    onEndDecelerating,
    onResizeContent,
  };
  const delegateRef = useRef(delegate);
  delegateRef.current = delegate;

  const methodsRef = useRef<PadMethods>({
    scrollTo(params) {
      dispatch({ type: 'scrollTo', payload: params });
    },
  });

  const contentOnResize = useCallback((contentSize: Size) => {
    dispatch({ type: 'setState', payload: { contentSize } });
  }, []);

  useIsomorphicLayoutEffect(() => {
    dispatch({ type: 'setState', payload: { pannable } });
  }, [pannable]);

  useIsomorphicLayoutEffect(() => {
    dispatch({
      type: 'setState',
      payload: {
        size,
        bound,
        contentInset,
        pagingEnabled,
        directionalLockEnabled,
      },
    });
  }, [size, bound, contentInset, pagingEnabled, directionalLockEnabled]);

  useIsomorphicLayoutEffect(() => {
    const prevState = prevStateRef.current;
    prevStateRef.current = state;

    if (prevState.pannable.translation !== state.pannable.translation) {
      if (state.pannable.translation) {
        if (prevState.pannable.translation) {
          dispatch({ type: 'dragMove' });
        } else {
          dispatch({ type: 'dragStart' });
        }
      } else {
        if (state.pannable.cancelled) {
          dispatch({ type: 'dragCancel' });
        } else {
          dispatch({ type: 'dragEnd' });
        }
      }
    }

    if (prevState.contentSize !== state.contentSize) {
      if (delegateRef.current.onResizeContent) {
        delegateRef.current.onResizeContent(state.contentSize);
      }
    }

    const evt: PadEvent = {
      size: state.size,
      contentSize: state.contentSize,
      contentInset: state.contentInset,
      contentOffset: state.contentOffset,
      contentVelocity: state.contentVelocity,
      dragging: !!state.drag,
      decelerating: !!state.deceleration,
    };

    if (prevState.contentOffset !== state.contentOffset) {
      if (delegateRef.current.onScroll) {
        delegateRef.current.onScroll(evt);
      }
    }
    if (prevState.drag !== state.drag) {
      if (!prevState.drag) {
        if (delegateRef.current.onStartDragging) {
          delegateRef.current.onStartDragging(evt);
        }
      } else if (!state.drag) {
        if (delegateRef.current.onEndDragging) {
          delegateRef.current.onEndDragging(evt);
        }
      }
    }
    if (prevState.deceleration !== state.deceleration) {
      if (!prevState.deceleration) {
        if (delegateRef.current.onStartDecelerating) {
          delegateRef.current.onStartDecelerating(evt);
        }
      } else if (!state.deceleration) {
        if (delegateRef.current.onEndDecelerating) {
          delegateRef.current.onEndDecelerating(evt);
        }
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

  const backgroundLayer = renderBackground
    ? renderBackground(state, methodsRef.current)
    : null;
  const overlayLayer = renderOverlay
    ? renderOverlay(state, methodsRef.current)
    : null;
  const contentLayer = render(state, methodsRef.current);

  const contentStyle = useMemo(
    () =>
      StyleSheet.create({
        position: 'absolute',
        left: state.contentInset.left,
        top: state.contentInset.top,
        width: state.contentSize.width,
        height: state.contentSize.height,
        transformTranslate: state.contentOffset,
        willChange: 'transform',
        overflow: 'hidden',
      }),
    [state.contentOffset, state.contentSize, state.contentInset]
  );

  const contextValue = useMemo(
    () => ({
      visibleRect: {
        x: -state.contentOffset.x,
        y: -state.contentOffset.y,
        width: state.size.width,
        height: state.size.height,
      },
      onResize: contentOnResize,
    }),
    [state.contentOffset, state.size, contentOnResize]
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
});

export default PadInner;
