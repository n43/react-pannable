import reducer, {
  initialPannableState,
  PannableState,
} from './pannableReducer';
import { Point } from './interfaces';
import { useIsomorphicLayoutEffect } from './utils/hooks';
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

export type PannableTrackEvent = {
  target: EventTarget;
  translation: Point | null;
  velocity: Point;
  interval: number;
};

export interface PannableProps {
  disabled?: boolean;
  shouldStart?: (evt: PannableEvent) => boolean;
  onTrackStart?: (evt: PannableTrackEvent) => void;
  onTrackEnd?: (evt: PannableTrackEvent) => void;
  onTrackCancel?: (evt: PannableTrackEvent) => void;
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
      onTrackStart,
      onTrackEnd,
      onTrackCancel,
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

    const isTracking = !!state.target;
    const isMoving = !!state.translation;

    useIsomorphicLayoutEffect(() => {
      const prevState = prevStateRef.current;
      prevStateRef.current = state;

      if (state.target === null) {
        if (prevState.target) {
          if (prevState.translation) {
            const evt: PannableEvent = {
              target: prevState.target,
              translation: prevState.translation,
              velocity: prevState.velocity,
              interval: prevState.interval,
            };

            if (state.cancelled) {
              if (onCancel) {
                onCancel(evt);
              }
            } else {
              if (onEnd) {
                onEnd(evt);
              }
            }
          }

          const trackEvt: PannableTrackEvent = {
            target: prevState.target,
            translation: prevState.translation,
            velocity: prevState.velocity,
            interval: prevState.interval,
          };

          if (state.cancelled) {
            if (onTrackCancel) {
              onTrackCancel(trackEvt);
            }
          } else {
            if (onTrackEnd) {
              onTrackEnd(trackEvt);
            }
          }
        }
      } else {
        if (prevState.target === null) {
          const trackEvt: PannableTrackEvent = {
            target: state.target,
            translation: state.translation,
            velocity: state.velocity,
            interval: state.interval,
          };

          if (onTrackStart) {
            onTrackStart(trackEvt);
          }
        }

        if (state.translation === null) {
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
              velocity: state.velocity,
              interval: state.interval,
            };

            if (shouldStart) {
              if (shouldStart(evt)) {
                dispatch({ type: 'start' });
              }
            } else {
              dispatch({ type: 'start' });
            }
          }
        } else {
          const evt: PannableEvent = {
            target: state.target,
            translation: state.translation,
            velocity: state.velocity,
            interval: state.interval,
          };

          if (prevState.translation === null) {
            if (onStart) {
              onStart(evt);
            }
          } else if (prevState.translation !== state.translation) {
            if (onMove) {
              onMove(evt);
            }
          }
        }
      }
    });

    useIsomorphicLayoutEffect(() => {
      if (disabled) {
        if (isTracking) {
          dispatch({ type: 'reset' });
        }
        return;
      }

      const elemNode = elemRef.current;

      if (!elemNode) {
        return;
      }

      const track = (target: EventTarget, point: Point) => {
        dispatch({ type: 'track', payload: { target, point } });
      };

      const move = (point: Point) => {
        dispatch({ type: 'move', payload: { point } });
      };

      const end = () => {
        dispatch({ type: 'end', payload: null });
      };

      if (isTracking) {
        if (supportsTouch) {
          const onTouchMove = (evt: TouchEvent) => {
            if (isMoving && evt.cancelable) {
              // evt.preventDefault();
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
              // evt.preventDefault();
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
          const onContextMenu = (evt: MouseEvent) => {
            evt.preventDefault();
          };

          const unsubscribeTouchStart = subscribeEvent(
            elemNode,
            'touchstart',
            onTouchStart
          );
          window.addEventListener('contextmenu', onContextMenu);

          return () => {
            unsubscribeTouchStart();
            window.removeEventListener('contextmenu', onContextMenu);
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
    }, [disabled, isTracking, isMoving]);

    const divStyle = useMemo(() => {
      const style: React.CSSProperties = {};

      if (isMoving) {
        Object.assign(style, {
          touchAction: 'none',
          pointerEvents: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          userSelect: 'none',
        });
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
