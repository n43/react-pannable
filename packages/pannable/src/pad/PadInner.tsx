import PadContext from './PadContext';
import reducer, {
  initialPadState,
  PadState,
  PadEvent,
  PadMethods,
  PadScrollTo,
} from './padReducer';
import { PannableState } from '../pannableReducer';
import { XY, Size, Bound, Inset } from '../interfaces';
import {
  requestAnimationFrame,
  cancelAnimationFrame,
} from '../utils/animationFrame';
import StyleSheet from '../utils/StyleSheet';
import { useIsomorphicLayoutEffect, usePrevious } from '../utils/hooks';
import React, {
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useCallback,
} from 'react';

export type PadInnerProps = {
  pannable: PannableState;
  size: Size;
  bound: Record<XY, Bound>;
  contentInset: Inset;
  pagingEnabled: boolean;
  directionalLockEnabled: boolean;
  onScroll: (evt: PadEvent) => void;
  onStartDragging: (evt: PadEvent) => void;
  onEndDragging: (evt: PadEvent) => void;
  onStartDecelerating: (evt: PadEvent) => void;
  onEndDecelerating: (evt: PadEvent) => void;
  onResizeContent: (evt: Size) => void;
  renderBackground: (state: PadState, methods: PadMethods) => React.ReactNode;
  renderOverlay: (state: PadState, methods: PadMethods) => React.ReactNode;
  scrollTo: PadScrollTo | null;
};

const PadInner: React.FC<PadInnerProps> = React.memo((props) => {
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
    scrollTo,
    children,
  } = props;
  const [state, dispatch] = useReducer(reducer, initialPadState);
  const prevState = usePrevious(state);
  const methodsRef = useRef<PadMethods>({
    _scrollTo(value: PadScrollTo) {
      dispatch({ type: 'scrollTo', payload: { value } });
    },
  });
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

  const contentOnResize = useCallback((contentSize: Size) => {
    dispatch({ type: 'syncProps', payload: { props: { contentSize } } });
  }, []);

  useMemo(() => {
    dispatch({
      type: 'syncProps',
      payload: {
        props: {
          pannable,
          size,
          bound,
          contentInset,
          pagingEnabled,
          directionalLockEnabled,
        },
      },
    });
  }, [
    pannable,
    size,
    bound,
    contentInset,
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
      delegateRef.current.onResizeContent(state.contentSize);
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
      delegateRef.current.onScroll(evt);
    }
    if (prevState.drag !== state.drag) {
      if (!prevState.drag) {
        delegateRef.current.onStartDragging(evt);
      } else if (!state.drag) {
        delegateRef.current.onEndDragging(evt);
      }
    }
    if (prevState.deceleration !== state.deceleration) {
      if (!prevState.deceleration) {
        delegateRef.current.onStartDecelerating(evt);
      } else if (!state.deceleration) {
        delegateRef.current.onEndDecelerating(evt);
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

  const backgroundLayer = renderBackground(state, methodsRef.current);
  const overlayLayer = renderOverlay(state, methodsRef.current);

  let contentLayer =
    typeof children === 'function'
      ? children(state, methodsRef.current)
      : children;

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
      width: null,
      height: null,
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
