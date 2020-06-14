import React, { useMemo, useCallback, useRef, useReducer } from 'react';
import { reducer, initialPannableState } from './pannableReducer';
import { useIsomorphicLayoutEffect } from './hooks/useIsomorphicLayoutEffect';
import { usePrevRef } from './hooks/usePrevRef';
import StyleSheet from './utils/StyleSheet';
import { addEventListener, removeEventListener } from './utils/eventListener';

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

  const innerRef = useRef({});
  innerRef.current.shouldStart = shouldStart;

  const touchSupported =
    typeof window !== undefined ? 'ontouchstart' in document : true;

  const track = useCallback((target, point) => {
    dispatch({ type: 'track', target, point, now: new Date().getTime() });
  }, []);

  const move = useCallback(point => {
    dispatch({
      type: 'move',
      point,
      now: new Date().getTime(),
      shouldStart: innerRef.current.shouldStart,
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
          onMove(state);
        } else {
          onStart(state);
        }
      } else if (prevState.translation) {
        if (state.enabled) {
          onEnd(prevState);
        } else {
          onCancel(prevState);
        }
      }
    }
  });

  const isMoving = !!state.translation;

  useIsomorphicLayoutEffect(() => {
    if (!state.enabled) {
      return;
    }

    if (state.target) {
      if (touchSupported) {
        const onTargetTouchMove = evt => {
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
        const onTargetTouchEnd = evt => {
          evt.preventDefault();

          end();
        };

        addEventListener(state.target, 'touchmove', onTargetTouchMove, false);
        addEventListener(state.target, 'touchend', onTargetTouchEnd, false);
        addEventListener(state.target, 'touchcancel', onTargetTouchEnd, false);

        return () => {
          removeEventListener(
            state.target,
            'touchmove',
            onTargetTouchMove,
            false
          );
          removeEventListener(
            state.target,
            'touchend',
            onTargetTouchEnd,
            false
          );
          removeEventListener(
            state.target,
            'touchcancel',
            onTargetTouchEnd,
            false
          );
        };
      } else {
        const onBodyMouseMove = evt => {
          if (isMoving) {
            evt.preventDefault();
          }

          if (evt.buttons === 1) {
            move({ x: evt.pageX, y: evt.pageY });
          } else {
            end();
          }
        };
        const onBodyMouseUp = evt => {
          evt.preventDefault();

          end();
        };

        const body = typeof document !== undefined ? document.body : null;

        addEventListener(body, 'mousemove', onBodyMouseMove, false);
        addEventListener(body, 'mouseup', onBodyMouseUp, false);

        return () => {
          removeEventListener(body, 'mousemove', onBodyMouseMove, false);
          removeEventListener(body, 'mouseup', onBodyMouseUp, false);
        };
      }
    } else {
      const elemNode = elemRef.current;

      if (touchSupported) {
        const onTouchStart = evt => {
          if (evt.touches.length === 1) {
            const touchEvent = evt.touches[0];

            track(touchEvent.target, {
              x: touchEvent.pageX,
              y: touchEvent.pageY,
            });
          }
        };

        addEventListener(elemNode, 'touchstart', onTouchStart, false);

        return () => {
          removeEventListener(elemNode, 'touchstart', onTouchStart, false);
        };
      } else {
        const onMouseDown = evt => {
          if (evt.buttons === 1) {
            track(evt.target, { x: evt.pageX, y: evt.pageY });
          }
        };

        addEventListener(elemNode, 'mousedown', onMouseDown, false);

        return () => {
          removeEventListener(elemNode, 'mousedown', onMouseDown, false);
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
