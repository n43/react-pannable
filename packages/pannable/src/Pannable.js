import React, { useRef, useMemo } from 'react';
import useIsomorphicLayoutEffect from './hooks/useIsomorphicLayoutEffect';
import usePannableReducer from './usePannableReducer';

/* eslint no-restricted-globals:"off" */

let root;

if (typeof self !== 'undefined') {
  root = self;
} else if (typeof window !== 'undefined') {
  root = window;
} else if (typeof global !== 'undefined') {
  root = global;
} else {
  root = {};
}

const defaultPannableProps = {
  enabled: true,
  shouldStart: () => true,
  onStart: () => {},
  onMove: () => {},
  onEnd: () => {},
  onCancel: () => {},
};

function Pannable({
  enabled = defaultPannableProps.enabled,
  shouldStart = defaultPannableProps.shouldStart,
  onStart = defaultPannableProps.onStart,
  onMove = defaultPannableProps.onMove,
  onEnd = defaultPannableProps.onEnd,
  onCancel = defaultPannableProps.onCancel,
  ...props
}) {
  const [state, dispatch] = usePannableReducer();
  const elemRef = useRef(null);
  const eventRef = useRef({ state, touchSupported: false });

  eventRef.current.shouldStart = shouldStart;
  eventRef.current.onStart = onStart;
  eventRef.current.onMove = onMove;
  eventRef.current.onEnd = onEnd;
  eventRef.current.onCancel = onCancel;

  useIsomorphicLayoutEffect(() => {
    function track(target, point) {
      dispatch({ type: 'track', target, point, now: new Date().getTime() });
    }

    function onTouchStart(evt) {
      eventRef.current.touchSupported = true;

      if (evt.touches && evt.touches.length === 1) {
        const touchEvent = evt.touches[0];

        track(touchEvent.target, { x: touchEvent.pageX, y: touchEvent.pageY });
      }
    }

    function onTouchMove(evt) {
      if (eventRef.current.state.translation) {
        evt.preventDefault();
      }
    }

    function onMouseDown(evt) {
      if (eventRef.current.touchSupported) {
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
  }, [enabled, dispatch]);

  useIsomorphicLayoutEffect(() => {
    function move(point) {
      dispatch({
        type: 'move',
        point,
        now: new Date().getTime(),
        shouldStart: eventRef.current.shouldStart,
      });
    }

    function end() {
      dispatch({ type: 'end' });
    }

    function onTargetTouchMove(evt) {
      const touchEvent = evt.touches[0];

      if (eventRef.current.state.translation) {
        evt.preventDefault();
      }

      move({ x: touchEvent.pageX, y: touchEvent.pageY });
    }

    function onTargetTouchEnd(evt) {
      if (eventRef.current.state.translation) {
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

    const target = state.target;

    if (!target) {
      return;
    }

    if (eventRef.current.touchSupported) {
      target.addEventListener('touchmove', onTargetTouchMove, false);
      target.addEventListener('touchend', onTargetTouchEnd, false);
      target.addEventListener('touchcancel', onTargetTouchEnd, false);

      return () => {
        target.removeEventListener('touchmove', onTargetTouchMove, false);
        target.removeEventListener('touchend', onTargetTouchEnd, false);
        target.removeEventListener('touchcancel', onTargetTouchEnd, false);
      };
    } else {
      root.addEventListener('mousemove', onRootMouseMove, false);
      root.addEventListener('mouseup', onRootMouseUp, false);

      return () => {
        root.removeEventListener('mousemove', onRootMouseMove, false);
        root.removeEventListener('mouseup', onRootMouseUp, false);
      };
    }
  }, [state.target, dispatch]);

  useIsomorphicLayoutEffect(() => {
    const {
      state: prevState,
      onStart,
      onMove,
      onEnd,
      onCancel,
    } = eventRef.current;
    const output = {
      target: state.target,
      translation: state.translation,
      velocity: state.velocity,
      interval: state.interval,
    };

    eventRef.current.state = state;

    if (state.translation !== prevState.translation) {
      if (state.translation) {
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
    if (enabled) {
      return;
    }

    dispatch({ type: 'disable' });
  }, [enabled, dispatch]);

  const elemStyle = {};

  if (state.translation) {
    elemStyle.touchAction = 'none';
    elemStyle.pointerEvents = 'none';
  }

  props.style = { ...elemStyle, ...props.style };
  props.ref = elemRef;

  return <div {...props} />;
}

Pannable.defaultProps = defaultPannableProps;

export default Pannable;
