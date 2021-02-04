import PadContext from './PadContext';
import reducer, {
  initialPadState,
  PadState,
  PadEvent,
  PadMethods,
  PadScrollTo,
} from './padReducer';
import { PannableState } from '../pannableReducer';
import { XY, Size } from '../interfaces';
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

const backgroundStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

export type PadInnerProps = {
  pannable: PannableState;
  size: Size;
  pagingEnabled: boolean;
  directionalLockEnabled: boolean;
  alwaysBounce: Record<XY, boolean>;
  isBoundless: Record<XY, boolean>;
  onScroll: (evt: PadEvent) => void;
  dragOnStart: (evt: PadEvent) => void;
  dragOnEnd: (evt: PadEvent) => void;
  decelerationOnStart: (evt: PadEvent) => void;
  decelerationOnEnd: (evt: PadEvent) => void;
  contentOnResize: (evt: Size) => void;
  renderBackground: (state: PadState, methods: PadMethods) => React.ReactNode;
  renderOverlay: (state: PadState, methods: PadMethods) => React.ReactNode;
  scrollTo: PadScrollTo | null;
};

const PadInner: React.FC<PadInnerProps> = React.memo(props => {
  const {
    pannable,
    size,
    pagingEnabled,
    directionalLockEnabled,
    alwaysBounce,
    isBoundless,
    onScroll,
    dragOnStart,
    dragOnEnd,
    decelerationOnStart,
    decelerationOnEnd,
    contentOnResize,
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
  const response = {
    onScroll,
    dragOnStart,
    dragOnEnd,
    decelerationOnStart,
    decelerationOnEnd,
    contentOnResize,
  };
  const responseRef = useRef(response);
  responseRef.current = response;

  const contextOnResize = useCallback((contentSize: Size) => {
    dispatch({ type: 'syncProps', payload: { props: { contentSize } } });
  }, []);

  useMemo(() => {
    dispatch({
      type: 'syncProps',
      payload: {
        props: {
          size,
          pannable,
          alwaysBounce,
          isBoundless,
          pagingEnabled,
          directionalLockEnabled,
        },
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
      responseRef.current.contentOnResize(state.contentSize);
    }

    const evt: PadEvent = {
      size: state.size,
      contentSize: state.contentSize,
      contentOffset: state.contentOffset,
      contentVelocity: state.contentVelocity,
      dragging: !!state.drag,
      decelerating: !!state.deceleration,
    };

    if (prevState.contentOffset !== state.contentOffset) {
      responseRef.current.onScroll(evt);
    }
    if (prevState.drag !== state.drag) {
      if (!prevState.drag) {
        responseRef.current.dragOnStart(evt);
      } else if (!state.drag) {
        responseRef.current.dragOnEnd(evt);
      }
    }
    if (prevState.deceleration !== state.deceleration) {
      if (!prevState.deceleration) {
        responseRef.current.decelerationOnStart(evt);
      } else if (!state.deceleration) {
        responseRef.current.decelerationOnEnd(evt);
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
      width: null,
      height: null,
      visibleRect: {
        x: -state.contentOffset.x,
        y: -state.contentOffset.y,
        width: state.size.width,
        height: state.size.height,
      },
      onResize: contextOnResize,
    }),
    [state.contentOffset, state.size, contextOnResize]
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
