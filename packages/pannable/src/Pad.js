import React, {
  isValidElement,
  cloneElement,
  useMemo,
  useCallback,
  useReducer,
} from 'react';
import { reducer, initialState } from './padReducer';
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
import { shouldDragStart } from './utils/motion';

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
  } = pannableProps;
  const [state, dispatch] = useReducer(reducer, initialState);
  const prevStateRef = usePrevRef(state);

  const {
    size,
    contentSize,
    contentOffset,
    contentVelocity,
    drag,
    deceleration,
    pannable,
  } = state;
  const prevState = prevStateRef.current;

  const resizeContent = useCallback(
    contentSize => dispatch({ type: 'setContentSize', value: contentSize }),
    []
  );

  const shouldPannableStart = useCallback(
    evt => {
      if (
        directionalLockEnabled &&
        !shouldDragStart(evt.velocity, size, contentSize)
      ) {
        return false;
      }

      return shouldStart(evt);
    },
    [shouldStart, directionalLockEnabled, size, contentSize]
  );

  useIsomorphicLayoutEffect(() => {
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
    if (pannable.translation !== prevState.pannable.translation) {
      if (pannable.translation) {
        if (prevState.pannable.translation) {
          dispatch({ type: 'dragMove', alwaysBounceX, alwaysBounceY });
        } else {
          dispatch({ type: 'dragStart', directionalLockEnabled });
        }
      } else if (prevState.pannable.translation) {
        if (enabled) {
          dispatch({ type: 'dragEnd' });
        } else {
          dispatch({ type: 'dragCancel' });
        }
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
  }, [state]);

  useMemo(() => {
    dispatch({ type: 'setSize', value: { width, height } });
  }, [width, height]);
  useMemo(() => {
    dispatch({ type: 'setPagingEnabled', value: pagingEnabled });
  }, [pagingEnabled]);

  useMemo(() => {
    if (scrollTo) {
      dispatch({ type: 'setContentOffset', ...scrollTo });
    }
  }, [scrollTo]);

  useMemo(() => {
    if (scrollToRect) {
      dispatch({ type: 'scrollToRect', ...scrollToRect });
    }
  }, [scrollToRect]);

  const visibleRect = {
    x: -contentOffset.x,
    y: -contentOffset.y,
    width: size.width,
    height: size.height,
  };

  const elemStyle = {
    overflow: 'hidden',
    position: 'relative',
    width: size.width,
    height: size.height,
  };

  pannableProps.style = { ...elemStyle, ...pannableProps.style };

  pannableProps.shouldStart = shouldPannableStart;

  return (
    <PadContext.Provider value={{ visibleRect, resizeContent }}>
      <Pannable {...pannableProps}>
        {pannableState => {
          if (pannableState !== pannable) {
            dispatch({ type: 'setPannable', value: pannableState });
          }

          let contentStyle = StyleSheet.create({
            position: 'relative',
            width: contentSize.width,
            height: contentSize.height,
            transformTranslate: [contentOffset.x, contentOffset.y],
            willChange: 'transform',
          });

          let element = pannableProps.children;

          if (typeof element === 'function') {
            element = element(state);
          }

          if (isValidElement(element) && element.type.PadContent) {
            if (element.props.style) {
              contentStyle = { ...contentStyle, ...element.props.style };
            }

            element = cloneElement(element, {
              style: contentStyle,
              ref: element.ref,
            });
          } else {
            element = (
              <GeneralContent style={contentStyle}>{element}</GeneralContent>
            );
          }

          return element;
        }}
      </Pannable>
    </PadContext.Provider>
  );
}

Pad.defaultProps = defaultPadProps;

export default Pad;
