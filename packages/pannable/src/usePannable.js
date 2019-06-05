import React, { useEffect, useRef, useMemo, useReducer } from 'react';

const MIN_DISTANCE = 0;

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

const initialState = {
  target: null,
  startPoint: null,
  movePoint: null,
  moveTime: null,
  translation: null,
  velocity: null,
  interval: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'render':
      return renderReducer(state, action);
    case 'track':
      return trackReducer(state, action);
    case 'move':
      return moveReducer(state, action);
    case 'end':
      return endReducer(state, action);
    default:
      return state;
  }
}

function renderReducer(state, action) {
  if (!action.enabled && state.target) {
    return initialState;
  }

  return state;
}

function trackReducer(state, action) {
  return {
    target: action.target,
    startPoint: action.point,
    movePoint: action.point,
    moveTime: action.now,
    translation: null,
    velocity: null,
    interval: null,
  };
}

function moveReducer(state, action) {
  const { target, startPoint, movePoint, moveTime, translation } = state;
  const { point: nextMovePoint, now: nextMoveTime, shouldStart } = action;

  if (!target) {
    return state;
  }

  const nextInterval = nextMoveTime - moveTime;
  const nextTranslation = {
    x: nextMovePoint.x - startPoint.x,
    y: nextMovePoint.y - startPoint.y,
  };
  const nextVelocity = {
    x: (nextMovePoint.x - movePoint.x) / nextInterval,
    y: (nextMovePoint.y - movePoint.y) / nextInterval,
  };

  if (translation) {
    return {
      target,
      startPoint,
      movePoint: nextMovePoint,
      moveTime: nextMoveTime,
      translation: nextTranslation,
      velocity: nextVelocity,
      interval: nextInterval,
    };
  }

  const dist = Math.sqrt(
    Math.pow(nextTranslation.x, 2) + Math.pow(nextTranslation.y, 2)
  );

  if (dist <= MIN_DISTANCE) {
    return {
      target,
      startPoint,
      movePoint: nextMovePoint,
      moveTime: nextMoveTime,
      translation: null,
      velocity: null,
      interval: null,
    };
  }

  if (
    !shouldStart({
      target,
      translation: nextTranslation,
      velocity: nextVelocity,
      interval: nextInterval,
    })
  ) {
    return initialState;
  }

  return {
    target,
    startPoint: nextMovePoint,
    movePoint: nextMovePoint,
    moveTime: nextMoveTime,
    translation: { x: 0, y: 0 },
    velocity: nextVelocity,
    interval: nextInterval,
  };
}

function endReducer(state, action) {
  if (!state.target) {
    return state;
  }

  return initialState;
}

export const defaultPannableProps = {
  enabled: true,
  shouldStart: () => true,
  onStart: () => {},
  onMove: () => {},
  onEnd: () => {},
  onCancel: () => {},
};

export function usePannable({
  enabled = defaultPannableProps.enabled,
  shouldStart = defaultPannableProps.shouldStart,
  onStart = defaultPannableProps.onStart,
  onMove = defaultPannableProps.onMove,
  onEnd = defaultPannableProps.onEnd,
  onCancel = defaultPannableProps.onCancel,
  ...props
}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const elemRef = useRef(null);
  const eventRef = useRef({ state, touchSupported: false });

  const prevState = eventRef.current.state;

  eventRef.current.state = state;
  eventRef.current.shouldStart = shouldStart;

  useEffect(() => {
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

  useEffect(() => {
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

    if (target) {
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
    }
  }, [state.target, dispatch]);

  useEffect(() => {
    const output = {
      target: state.target,
      translation: state.translation,
      velocity: state.velocity,
      interval: state.interval,
    };

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

  useMemo(() => dispatch({ type: 'render', enabled }), [enabled, dispatch]);

  const elemStyle = {};

  if (state.translation) {
    elemStyle.touchAction = 'none';
    elemStyle.pointerEvents = 'none';
  }

  props.style = {
    ...elemStyle,
    ...props.style,
  };

  props.ref = elemRef;

  return [<div {...props} />, { state }];
}
