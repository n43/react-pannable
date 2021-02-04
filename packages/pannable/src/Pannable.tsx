import reducer, {
  initialPannableState,
  PannableEvent,
} from './pannableReducer';
import { Point } from './interfaces';
import { useIsomorphicLayoutEffect, usePrevious } from './utils/hooks';
import StyleSheet from './utils/StyleSheet';
import subscribeEvent from './utils/subscribeEvent';
import React, { useMemo, useRef, useReducer } from 'react';

const supportsTouch =
  typeof window !== undefined ? 'ontouchstart' in window : false;

export interface PannableProps {
  enabled?: boolean;
  shouldStart?: (evt: PannableEvent) => boolean;
  onStart?: (evt: PannableEvent) => void;
  onMove?: (evt: PannableEvent) => void;
  onEnd?: (evt: PannableEvent) => void;
  onCancel?: (evt: PannableEvent) => void;
}

export const defaultPannableProps: PannableProps = {
  enabled: true,
  shouldStart: () => true,
  onStart: () => {},
  onMove: () => {},
  onEnd: () => {},
  onCancel: () => {},
};

const Pannable: React.FC<PannableProps &
  React.HTMLAttributes<HTMLDivElement>> = React.memo(props => {
  const {
    enabled,
    shouldStart,
    onStart,
    onMove,
    onEnd,
    onCancel,
    children,
    ...divProps
  } = props as Required<PannableProps> & React.HTMLAttributes<HTMLDivElement>;
  const [state, dispatch] = useReducer(reducer, initialPannableState);
  const prevState = usePrevious(state);
  const elemRef = useRef<HTMLDivElement>(null);
  const response = { shouldStart, onStart, onMove, onEnd, onCancel };
  const responseRef = useRef(response);
  responseRef.current = response;

  const isMoving = !!state.translation;

  useMemo(() => {
    dispatch({
      type: 'setEnabled',
      payload: { enabled },
    });
  }, [enabled]);

  useIsomorphicLayoutEffect(() => {
    if (prevState.translation !== state.translation) {
      if (state.translation) {
        const evt: PannableEvent = {
          translation: state.translation,
          velocity: state.velocity!,
          interval: state.interval!,
          target: state.target!,
        };

        if (prevState.translation) {
          responseRef.current.onMove(evt);
        } else {
          responseRef.current.onStart(evt);
        }
      } else if (prevState.translation) {
        const evt: PannableEvent = {
          translation: prevState.translation,
          velocity: prevState.velocity!,
          interval: prevState.interval!,
          target: prevState.target!,
        };

        if (state.enabled) {
          responseRef.current.onEnd(evt);
        } else {
          responseRef.current.onCancel(evt);
        }
      }
    }
  }, [state]);

  useIsomorphicLayoutEffect(() => {
    if (!state.enabled) {
      return;
    }

    const elemNode = elemRef.current;

    if (!elemNode) {
      return;
    }

    const track = (target: EventTarget, point: Point) =>
      dispatch({
        type: 'track',
        payload: { target, point },
      });

    const move = (point: Point) =>
      dispatch({
        type: 'move',
        payload: {
          point,
          shouldStart: responseRef.current.shouldStart,
        },
      });

    const end = () => dispatch({ type: 'end', payload: null });

    if (state.target) {
      if (supportsTouch) {
        const onTouchMove = (evt: TouchEvent) => {
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
        const onTouchEnd = (evt: TouchEvent) => {
          if (isMoving && evt.cancelable) {
            evt.preventDefault();
          }

          end();
        };

        const unsubscribeTouchMove = subscribeEvent(
          elemNode,
          'touchmove',
          onTouchMove
        );
        const unsubscribeTouchEnd = subscribeEvent(
          elemNode,
          'touchend',
          onTouchEnd
        );
        const unsubscribeTouchCancel = subscribeEvent(
          elemNode,
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
          }

          if (evt.buttons === 1) {
            move({ x: evt.pageX, y: evt.pageY });
          } else {
            end();
          }
        };
        const onMouseUp = (evt: MouseEvent) => {
          if (isMoving) {
            evt.preventDefault();
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
          if (evt.buttons === 1 && evt.target) {
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
  }, [state.enabled, state.target, isMoving, dispatch]);

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

  const element: React.ReactNode =
    typeof children === 'function' ? children(state) : children;

  return (
    <div {...divProps} ref={elemRef}>
      {element}
    </div>
  );
});

Pannable.defaultProps = defaultPannableProps;

export default Pannable;
