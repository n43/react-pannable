import React, { useMemo, useCallback, useRef, useReducer } from 'react';
import reducer, { initialPannableState } from './pannableReducer';
import { useIsomorphicLayoutEffect } from './hooks/useIsomorphicLayoutEffect';
import { usePrevRef } from './hooks/usePrevRef';
import StyleSheet from './utils/StyleSheet';
import subscribeEvent from './utils/subscribeEvent';

const supportsTouch =
  typeof window !== undefined ? 'ontouchstart' in window : false;

const defaultPannableProps = {
  enabled: true,
  shouldStart: () => true,
  onStart: () => {},
  onMove: () => {},
  onEnd: () => {},
  onCancel: () => {},
};

function Pannable(props) {
  const {
    enabled,
    shouldStart,
    onStart,
    onMove,
    onEnd,
    onCancel,
    children,
    ...divProps
  } = props;
  const [state, dispatch] = useReducer(reducer, initialPannableState);
  const prevStateRef = usePrevRef(state);
  const prevState = prevStateRef.current;
  const elemRef = useRef(null);
  const responseRef = useRef({});

  responseRef.current = { shouldStart, onStart, onMove, onEnd, onCancel };

  const track = useCallback((target, point) => {
    dispatch({ type: 'track', target, point });
  }, []);

  const move = useCallback(point => {
    dispatch({
      type: 'move',
      point,
      shouldStart: responseRef.current.shouldStart,
    });
  }, []);

  const end = useCallback(() => {
    dispatch({ type: 'end' });
  }, []);

  useMemo(() => {
    dispatch({ type: 'syncEnabled', enabled });
  }, [enabled]);

  useIsomorphicLayoutEffect(() => {
    if (prevState.translation !== state.translation) {
      if (state.translation) {
        if (prevState.translation) {
          responseRef.current.onMove(state);
        } else {
          responseRef.current.onStart(state);
        }
      } else if (prevState.translation) {
        if (state.enabled) {
          responseRef.current.onEnd(prevState);
        } else {
          responseRef.current.onCancel(prevState);
        }
      }
    }
  }, [state]);

  const isMoving = !!state.translation;

  useIsomorphicLayoutEffect(() => {
    if (!state.enabled) {
      return;
    }

    if (state.target) {
      if (supportsTouch) {
        const onTouchMove = evt => {
          if (isMoving && evt.cancelable) {
            evt.preventDefault();
          }

          if (evt.touches.length === 1) {
            const touchEvent = evt.touches[0];

            move({ x: touchEvent.pageX, y: touchEvent.pageY });
          } else {
            end();
          }
        };
        const onTouchEnd = evt => {
          if (isMoving && evt.cancelable) {
            evt.preventDefault();
          }

          end();
        };

        const unsubscribeTouchMove = subscribeEvent(
          state.target,
          'touchmove',
          onTouchMove
        );
        const unsubscribeTouchEnd = subscribeEvent(
          state.target,
          'touchend',
          onTouchEnd
        );
        const unsubscribeTouchCancel = subscribeEvent(
          state.target,
          'touchcancel',
          onTouchEnd
        );

        return () => {
          unsubscribeTouchMove();
          unsubscribeTouchEnd();
          unsubscribeTouchCancel();
        };
      } else {
        const onMouseMove = evt => {
          if (isMoving) {
            evt.preventDefault();
          }

          if (evt.buttons === 1) {
            move({ x: evt.pageX, y: evt.pageY });
          } else {
            end();
          }
        };
        const onMouseUp = evt => {
          if (isMoving) {
            evt.preventDefault();
          }

          end();
        };

        const body = typeof document !== undefined ? document.body : null;

        const unsubscribeMouseMove = subscribeEvent(
          body,
          'mousemove',
          onMouseMove
        );
        const unsubscribeMouseUp = subscribeEvent(body, 'mouseup', onMouseUp);

        return () => {
          unsubscribeMouseMove();
          unsubscribeMouseUp();
        };
      }
    } else {
      const elemNode = elemRef.current;

      if (supportsTouch) {
        const onTouchStart = evt => {
          if (evt.touches.length === 1) {
            const touchEvent = evt.touches[0];

            track(touchEvent.target, {
              x: touchEvent.pageX,
              y: touchEvent.pageY,
            });
          }
        };

        const unsubscribeTouchStart = subscribeEvent(
          elemNode,
          'touchstart',
          onTouchStart
        );

        return () => {
          unsubscribeTouchStart();
        };
      } else {
        const onMouseDown = evt => {
          if (evt.buttons === 1) {
            track(evt.target, { x: evt.pageX, y: evt.pageY });
          }
        };

        const unsubscribeMouseDown = subscribeEvent(
          elemNode,
          'mousedown',
          onMouseDown
        );

        return () => {
          unsubscribeMouseDown();
        };
      }
    }
  }, [state.enabled, state.target, isMoving, track, move, end]);

  const divStyle = useMemo(() => {
    const style = {};

    if (isMoving) {
      Object.assign(
        style,
        StyleSheet.create({
          touchAction: 'none',
          pointerEvents: 'none',
          userSelect: 'none',
        })
      );
    }

    if (divProps.style) {
      Object.assign(style, divProps.style);
    }

    return style;
  }, [isMoving, divProps.style]);

  divProps.style = divStyle;

  const element = typeof children === 'function' ? children(state) : children;

  return (
    <div {...divProps} ref={elemRef}>
      {element}
    </div>
  );
}

Pannable.defaultProps = defaultPannableProps;

export default Pannable;
