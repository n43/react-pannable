import React, { useRef, useMemo, useReducer } from 'react';
import { initialState, reducer } from './pannableReducer';
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
  const [state, dispatch] = useReducer(reducer, initialState);
  const prevStateRef = usePrevRef(state);
  const elemRef = useRef(null);
  const innerRef = useRef({ touchSupported: false });

  innerRef.current.state = state;
  innerRef.current.shouldStart = shouldStart;
  const { target, translation, velocity, interval } = state;
  const output = { target, translation, velocity, interval };
  const prevState = prevStateRef.current;

  useIsomorphicLayoutEffect(() => {
    function track(target, point) {
      dispatch({ type: 'track', target, point, now: new Date().getTime() });
    }

    function onTouchStart(evt) {
      innerRef.current.touchSupported = true;

      if (evt.touches && evt.touches.length === 1) {
        const touchEvent = evt.touches[0];

        track(touchEvent.target, { x: touchEvent.pageX, y: touchEvent.pageY });
      }
    }

    function onTouchMove(evt) {
      if (innerRef.current.state.translation) {
        evt.preventDefault();
      }
    }

    function onMouseDown(evt) {
      if (innerRef.current.touchSupported) {
        return;
      }

      track(evt.target, { x: evt.pageX, y: evt.pageY });
    }

    if (enabled) {
      const elemNode = elemRef.current;

      if (!elemNode.addEventListener) {
        return;
      }

      elemNode.addEventListener('touchstart', onTouchStart, false);
      elemNode.addEventListener('touchmove', onTouchMove, false);
      elemNode.addEventListener('mousedown', onMouseDown, false);

      return () => {
        elemNode.removeEventListener('touchstart', onTouchStart, false);
        elemNode.removeEventListener('touchmove', onTouchMove, false);
        elemNode.removeEventListener('mousedown', onMouseDown, false);
      };
    }
  }, [enabled]);

  useIsomorphicLayoutEffect(() => {
    function move(point) {
      dispatch({
        type: 'move',
        point,
        now: new Date().getTime(),
        shouldStart: innerRef.current.shouldStart,
      });
    }

    function end() {
      dispatch({ type: 'end' });
    }

    function onTargetTouchMove(evt) {
      const touchEvent = evt.touches[0];

      if (innerRef.current.state.translation) {
        evt.preventDefault();
      }

      move({ x: touchEvent.pageX, y: touchEvent.pageY });
    }

    function onTargetTouchEnd(evt) {
      if (innerRef.current.state.translation) {
        evt.preventDefault();
      }

      end();
    }

    function onRootMouseMove(evt) {
      evt.preventDefault();

      move({ x: evt.pageX, y: evt.pageY });
    }

    function onRootMouseUp(evt) {
      evt.preventDefault();

      end();
    }

    if (!target) {
      return;
    }

    if (innerRef.current.touchSupported) {
      target.addEventListener('touchmove', onTargetTouchMove, false);
      target.addEventListener('touchend', onTargetTouchEnd, false);
      target.addEventListener('touchcancel', onTargetTouchEnd, false);

      return () => {
        target.removeEventListener('touchmove', onTargetTouchMove, false);
        target.removeEventListener('touchend', onTargetTouchEnd, false);
        target.removeEventListener('touchcancel', onTargetTouchEnd, false);
      };
    } else {
      addEventListener('mousemove', onRootMouseMove, false);
      addEventListener('mouseup', onRootMouseUp, false);

      return () => {
        removeEventListener('mousemove', onRootMouseMove, false);
        removeEventListener('mouseup', onRootMouseUp, false);
      };
    }
  }, [target]);

  useIsomorphicLayoutEffect(() => {
    if (prevState.translation !== translation) {
      if (translation) {
        if (prevState.translation) {
          onMove(output);
        } else {
          onStart(output);
        }
      } else if (prevState.translation) {
        if (enabled) {
          onEnd(output);
        } else {
          onCancel(output);
        }
      }
    }
  });

  useMemo(() => {
    if (!enabled) {
      dispatch({ type: 'disable' });
    }
  }, [enabled]);

  const elemStyle = {};

  if (translation) {
    Object.assign(
      elemStyle,
      StyleSheet.create({
        touchAction: 'none',
        pointerEvents: 'none',
        userSelect: 'none',
      })
    );
  }

  if (divProps.style) {
    Object.assign(elemStyle, divProps.style);
  }

  divProps.style = elemStyle;

  const element = typeof children === 'function' ? children(state) : children;

  return (
    <div {...divProps} ref={elemRef}>
      {element}
    </div>
  );
}

Pannable.defaultProps = defaultPannableProps;

export default Pannable;
