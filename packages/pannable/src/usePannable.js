import { useState, useEffect, useCallback, useRef } from 'react';
import StyleSheet from './utils/StyleSheet';

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

export const defaultProps = {
  enabled: true,
  shouldStart: () => true,
  onStart: () => {},
  onMove: () => {},
  onEnd: () => {},
  onCancel: () => {},
};

export function usePannable({
  enabled = defaultProps.enabled,
  shouldStart = defaultProps.shouldStart,
  onStart = defaultProps.onStart,
  onMove = defaultProps.onMove,
  onEnd = defaultProps.onEnd,
  onCancel = defaultProps.onCancel,
  ...props
}) {
  const [data, setData] = useState({
    target: null,
    startPoint: null,
    movePoint: null,
    moveTime: null,
    translation: null,
    velocity: null,
    interval: null,
  });

  const elemRef = useRef(null);
  const eventRef = useRef({
    touchSupported: false,
    data,
    shouldStart,
  });

  const track = useCallback((target, point) => {
    setData({
      target,
      startPoint: point,
      movePoint: point,
      moveTime: new Date().getTime(),
      translation: null,
      velocity: null,
      interval: null,
    });
  }, []);

  const move = useCallback(point => {
    setData(prevData => {
      const { target, startPoint, movePoint, moveTime, translation } = prevData;
      const { shouldStart } = eventRef.current;

      if (!target) {
        return prevData;
      }

      const nextMovePoint = point;
      const nextMoveTime = new Date().getTime();

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
        nextTranslation.x * nextTranslation.x +
          nextTranslation.y * nextTranslation.y
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
        return {
          target: null,
          startPoint: null,
          movePoint: null,
          moveTime: null,
          translation: null,
          velocity: null,
          interval: null,
        };
      }

      return {
        target,
        startPoint: point,
        movePoint: nextMovePoint,
        moveTime: nextMoveTime,
        translation: { x: 0, y: 0 },
        velocity: nextVelocity,
        interval: nextInterval,
      };
    });
  }, []);

  const end = useCallback(() => {
    setData(prevData => {
      const { target } = prevData;

      if (!target) {
        return prevData;
      }

      return {
        target: null,
        startPoint: null,
        movePoint: null,
        moveTime: null,
        translation: null,
        velocity: null,
        interval: null,
      };
    });
  }, []);

  useEffect(() => {
    function onTouchStart(evt) {
      eventRef.current.touchSupported = true;

      if (evt.touches && evt.touches.length === 1) {
        const touchEvent = evt.touches[0];

        track(touchEvent.target, { x: touchEvent.pageX, y: touchEvent.pageY });
      }
    }

    function onTouchMove(evt) {
      if (eventRef.current.data.translation) {
        evt.preventDefault();
      }
    }

    function onMouseDown(evt) {
      if (eventRef.current.touchSupported) {
        return;
      }

      track(evt.target, { x: evt.pageX, y: evt.pageY });
    }

    const elemNode = elemRef.current;

    if (enabled) {
      if (!elemNode.addEventListener) {
        return;
      }

      elemNode.addEventListener('touchstart', onTouchStart, false);
      elemNode.addEventListener('touchmove', onTouchMove, false);
      elemNode.addEventListener('mousedown', onMouseDown, false);
    }

    return () => {
      if (enabled) {
        elemNode.removeEventListener('touchstart', onTouchStart, false);
        elemNode.removeEventListener('touchmove', onTouchMove, false);
        elemNode.removeEventListener('mousedown', onMouseDown, false);
      }
    };
  }, [enabled, track]);

  useEffect(() => {
    function onTargetTouchMove(evt) {
      const touchEvent = evt.touches[0];

      if (eventRef.current.data.translation) {
        evt.preventDefault();
      }

      move({ x: touchEvent.pageX, y: touchEvent.pageY });
    }

    function onTargetTouchEnd(evt) {
      if (eventRef.current.data.translation) {
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

    const target = data.target;
    const { touchSupported } = eventRef.current;

    if (target) {
      if (touchSupported) {
        target.addEventListener('touchmove', onTargetTouchMove, false);
        target.addEventListener('touchend', onTargetTouchEnd, false);
        target.addEventListener('touchcancel', onTargetTouchEnd, false);
      } else {
        root.addEventListener('mousemove', onRootMouseMove, false);
        root.addEventListener('mouseup', onRootMouseUp, false);
      }
    }

    return () => {
      if (target) {
        if (touchSupported) {
          target.removeEventListener('touchmove', onTargetTouchMove, false);
          target.removeEventListener('touchend', onTargetTouchEnd, false);
          target.removeEventListener('touchcancel', onTargetTouchEnd, false);
        } else {
          root.removeEventListener('mousemove', onRootMouseMove, false);
          root.removeEventListener('mouseup', onRootMouseUp, false);
        }
      }
    };
  }, [data.target, move, end]);

  useEffect(() => {
    const output = {
      target: data.target,
      translation: data.translation,
      velocity: data.velocity,
      interval: data.interval,
    };

    if (data.translation !== prevData.translation) {
      if (data.translation) {
        if (prevData.translation) {
          onMove(output);
        } else {
          onStart(output);
        }
      } else if (prevData.translation) {
        if (enabled) {
          onEnd(output);
        } else {
          onCancel(output);
        }
      }

      if (!enabled && data.target) {
        end();
      }
    }
  });

  const prevData = eventRef.current.data;
  eventRef.current.data = data;
  eventRef.current.shouldStart = shouldStart;

  const elemStyle = {};

  if (enabled) {
    elemStyle.touchAction = 'none';
  }
  if (data.translation) {
    elemStyle.userSelect = 'none';
    elemStyle.pointerEvents = 'none';
  }

  props.style = {
    ...StyleSheet.create(elemStyle),
    ...props.style,
  };

  props.ref = elemRef;
  props.pannable.data = data;

  return props;
}
