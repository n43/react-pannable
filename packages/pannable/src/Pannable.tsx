import reducer, {
  initialPannableState,
  PannableState,
} from './pannableReducer';
import { Point } from './interfaces';
import { useIsomorphicLayoutEffect } from './utils/hooks';
import StyleSheet from './utils/StyleSheet';
import subscribeEvent from './utils/subscribeEvent';
import React, { useMemo, useRef, useReducer } from 'react';

const supportsTouch =
  typeof window !== 'undefined' ? 'ontouchstart' in window : false;

const MIN_START_DISTANCE = 0;

export type PannableEvent = {
  target: EventTarget;
  translation: Point;
  velocity: Point;
  interval: number;
};

export interface PannableProps {
  disabled?: boolean;
  shouldStart?: (evt: PannableEvent) => boolean;
  onStart?: (evt: PannableEvent) => void;
  onMove?: (evt: PannableEvent) => void;
  onEnd?: (evt: PannableEvent) => void;
  onCancel?: (evt: PannableEvent) => void;
  render?: (state: PannableState) => React.ReactNode;
}

export const Pannable = React.memo<React.ComponentProps<'div'> & PannableProps>(
  (props) => {
    const {
      disabled,
      shouldStart,
      onStart,
      onMove,
      onEnd,
      onCancel,
      render,
      children,
      ...divProps
    } = props;
    const [state, dispatch] = useReducer(reducer, initialPannableState);
    const prevStateRef = useRef(state);
    const elemRef = useRef<HTMLDivElement>(null);
    const delegate = { shouldStart, onStart, onMove, onEnd, onCancel };
    const delegateRef = useRef(delegate);
    delegateRef.current = delegate;

    const isMoving = !!state.translation;

    useIsomorphicLayoutEffect(() => {
      const prevState = prevStateRef.current;
      prevStateRef.current = state;

      if (state.target && !state.translation) {
        const translation = {
          x: state.movePoint.x - state.startPoint.x,
          y: state.movePoint.y - state.startPoint.y,
        };
        const dist = Math.sqrt(
          Math.pow(translation.x, 2) + Math.pow(translation.y, 2)
        );

        if (dist > MIN_START_DISTANCE) {
          const evt: PannableEvent = {
            target: state.target,
            translation,
            velocity: state.velocity!,
            interval: state.interval!,
          };

          if (delegateRef.current.shouldStart) {
            if (delegateRef.current.shouldStart(evt)) {
              dispatch({ type: 'start' });
            }
          } else {
            dispatch({ type: 'start' });
          }
        }
      }
      if (prevState.translation !== state.translation) {
        if (state.translation) {
          const evt: PannableEvent = {
            target: state.target!,
            translation: state.translation,
            velocity: state.velocity!,
            interval: state.interval!,
          };

          if (prevState.translation) {
            if (delegateRef.current.onMove) {
              delegateRef.current.onMove(evt);
            }
          } else {
            if (delegateRef.current.onStart) {
              delegateRef.current.onStart(evt);
            }
          }
        } else if (prevState.translation) {
          const evt: PannableEvent = {
            target: prevState.target!,
            translation: prevState.translation,
            velocity: prevState.velocity!,
            interval: prevState.interval!,
          };

          if (state.cancelled) {
            if (delegateRef.current.onCancel) {
              delegateRef.current.onCancel(evt);
            }
          } else {
            if (delegateRef.current.onEnd) {
              delegateRef.current.onEnd(evt);
            }
          }
        }
      }
    }, [state]);

    useIsomorphicLayoutEffect(() => {
      if (disabled) {
        if (state.target) {
          dispatch({ type: 'reset' });
        }
        return;
      }

      const elemNode = elemRef.current;

      if (!elemNode) {
        return;
      }

      const track = (target: EventTarget, point: Point) => {
        dispatch({
          type: 'track',
          payload: { target, point },
        });
      };

      const move = (point: Point) => {
        dispatch({
          type: 'move',
          payload: { point },
        });
      };

      const end = () => {
        dispatch({ type: 'end', payload: null });
      };

      if (state.target) {
        if (supportsTouch) {
          const onTouchMove = (evt: TouchEvent) => {
            if (isMoving && evt.cancelable) {
              evt.preventDefault();
              evt.stopImmediatePropagation();
            }

            if (evt.touches.length === 1) {
              const touchEvent = evt.touches[0];

              move({ x: touchEvent.pageX, y: touchEvent.pageY });
            } else {
              end();
            }
          };
          const onTouchEnd = (evt: TouchEvent) => {
            if (isMoving && evt.cancelable) {
              evt.preventDefault();
              evt.stopImmediatePropagation();
            }

            end();
          };

          const body = document.body;

          const unsubscribeTouchMove = subscribeEvent(
            body,
            'touchmove',
            onTouchMove
          );
          const unsubscribeTouchEnd = subscribeEvent(
            body,
            'touchend',
            onTouchEnd
          );
          const unsubscribeTouchCancel = subscribeEvent(
            body,
            'touchcancel',
            onTouchEnd
          );

          return () => {
            unsubscribeTouchMove();
            unsubscribeTouchEnd();
            unsubscribeTouchCancel();
          };
        } else {
          const onMouseMove = (evt: MouseEvent) => {
            if (isMoving) {
              evt.preventDefault();
              evt.stopImmediatePropagation();
            }

            if (evt.buttons === undefined || evt.buttons === 1) {
              move({ x: evt.pageX, y: evt.pageY });
            } else {
              end();
            }
          };
          const onMouseUp = (evt: MouseEvent) => {
            if (isMoving) {
              evt.preventDefault();
              evt.stopImmediatePropagation();
            }

            end();
          };

          const body = document.body;

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
        if (supportsTouch) {
          const onTouchStart = (evt: TouchEvent) => {
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
          const onMouseDown = (evt: MouseEvent) => {
            if (
              evt.target &&
              (evt.buttons === undefined || evt.buttons === 1)
            ) {
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
    }, [disabled, state.target, isMoving]);

    const divStyle = useMemo(() => {
      const style: React.CSSProperties = {};

      if (isMoving) {
        Object.assign(
          style,
          StyleSheet.create({
            touchAction: 'none',
            pointerEvents: 'none',
            userSelectNone: true,
          })
        );
      }

      if (divProps.style) {
        Object.assign(style, divProps.style);
      }

      return style;
    }, [isMoving, divProps.style]);

    divProps.style = divStyle;

    return (
      <div {...divProps} ref={elemRef}>
        {render ? render(state) : children}
      </div>
    );
  }
);

export default Pannable;
