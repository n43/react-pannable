import React, { useState, useEffect, useCallback, useRef } from 'react';
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

export default function Pannable({
  enabled = true,
  shouldStart = () => true,
  onStart,
  onMove,
  onEnd,
  onCancel,
  ...props
} = {}) {
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
  const touchSupported = useRef(false);
  const eventRef = useRef({
    data,
    shouldStart,
    onStart,
    onMove,
    onEnd,
    onCancel,
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
    const {
      data: { target, startPoint, movePoint, moveTime, translation },
      shouldStart,
    } = eventRef.current;

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
      setData({
        target,
        startPoint,
        movePoint: nextMovePoint,
        moveTime: nextMoveTime,
        translation: nextTranslation,
        velocity: nextVelocity,
        interval: nextInterval,
      });
      return;
    }

    const dist = Math.sqrt(
      nextTranslation.x * nextTranslation.x +
        nextTranslation.y * nextTranslation.y
    );

    if (dist <= MIN_DISTANCE) {
      setData({
        target,
        startPoint,
        movePoint: nextMovePoint,
        moveTime: nextMoveTime,
        translation: null,
        velocity: null,
        interval: null,
      });
      return;
    }

    if (
      !shouldStart({
        target,
        translation: nextTranslation,
        velocity: nextVelocity,
        interval: nextInterval,
      })
    ) {
      setData({
        target: null,
        startPoint: null,
        movePoint: null,
        moveTime: null,
        translation: null,
        velocity: null,
        interval: null,
      });
      return;
    }

    setData({
      target,
      startPoint: point,
      movePoint: nextMovePoint,
      moveTime: nextMoveTime,
      translation: { x: 0, y: 0 },
      velocity: nextVelocity,
      interval: nextInterval,
    });
  }, []);

  const end = useCallback(() => {
    setData({
      target: null,
      startPoint: null,
      movePoint: null,
      moveTime: null,
      translation: null,
      velocity: null,
      interval: null,
    });
  }, []);

  useEffect(() => {
    function onTouchStart(evt) {
      touchSupported.current = true;

      if (evt.touches && evt.touches.length === 1) {
        const touchEvent = evt.touches[0];

        track(touchEvent.target, { x: touchEvent.pageX, y: touchEvent.pageY });
      }
    }

    function onTouchMove(evt) {
      const { translation } = eventRef.current.data;

      if (translation) {
        evt.preventDefault();
      }
    }

    function onMouseDown(evt) {
      if (touchSupported.current) {
        return;
      }

      track(evt.target, { x: evt.pageX, y: evt.pageY });
    }

    const elemNode = elemRef.current;
    const { target } = eventRef.current.data;

    if (enabled) {
      if (!elemNode.addEventListener) {
        return;
      }

      elemNode.addEventListener('touchstart', onTouchStart, false);
      elemNode.addEventListener('touchmove', onTouchMove, false);
      elemNode.addEventListener('mousedown', onMouseDown, false);
    } else {
      if (target) {
        end();
      }
    }

    return () => {
      if (enabled) {
        elemNode.removeEventListener('touchstart', onTouchStart, false);
        elemNode.removeEventListener('touchmove', onTouchMove, false);
        elemNode.removeEventListener('mousedown', onMouseDown, false);
      }
    };
  }, [enabled, track, end]);

  useEffect(() => {
    function onTargetTouchMove(evt) {
      const { startPoint, translation } = eventRef.current.data;
      const touchEvent = evt.touches[0];

      if (translation) {
        evt.preventDefault();
      }
      if (startPoint) {
        move({ x: touchEvent.pageX, y: touchEvent.pageY });
      }
    }

    function onTargetTouchEnd(evt) {
      const { translation } = eventRef.current.data;

      if (translation) {
        evt.preventDefault();

        end();
      }
    }

    function onRootMouseMove(evt) {
      const { startPoint } = eventRef.current.data;

      evt.preventDefault();

      if (startPoint) {
        move({ x: evt.pageX, y: evt.pageY });
      }
    }

    function onRootMouseUp(evt) {
      const { translation } = eventRef.current.data;

      evt.preventDefault();

      if (translation) {
        end();
      }
    }

    const target = data.target;

    if (target) {
      if (touchSupported.current) {
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
        if (touchSupported.current) {
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
          onMove && onMove(output);
        } else {
          onStart && onStart(output);
        }
      } else if (prevData.translation) {
        if (enabled) {
          onEnd && onEnd(output);
        } else {
          onCancel && onCancel(output);
        }
      }
    }
  });

  const prevData = eventRef.current.data;
  eventRef.current = { data, shouldStart, onStart, onMove, onEnd, onCancel };

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

  return <div {...props} ref={elemRef} />;
}
