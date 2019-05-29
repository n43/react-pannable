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
  const [target, setTarget] = useState(null);
  const [startPoint, setStartPoint] = useState(null);
  const [movePoint, setMovePoint] = useState(null);
  const [moveTime, setMoveTime] = useState(null);
  const [translation, setTranslation] = useState(null);
  const [velocity, setVelocity] = useState(null);
  const [interval, setInterval] = useState(null);

  const elemRef = useRef(null);
  const clickPrevented = useRef(false);
  const eventRef = useRef();

  useEffect(() => {
    eventRef.current = {
      target,
      startPoint,
      movePoint,
      moveTime,
      translation,
      velocity,
      interval,
      shouldStart,
      onStart,
      onMove,
      onEnd,
      onCancel,
    };
  });

  const track = useCallback(evt => {
    setStartPoint({ x: evt.pageX, y: evt.pageY });
    setMovePoint({ x: evt.pageX, y: evt.pageY });
    setMoveTime(new Date().getTime());
  }, []);

  const move = useCallback(evt => {
    const {
      target,
      startPoint,
      movePoint,
      moveTime,
      shouldStart,
    } = eventRef.current;
    const nextMovePoint = { x: evt.pageX, y: evt.pageY };
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

    if (target) {
      setMovePoint(nextMovePoint);
      setMoveTime(nextMoveTime);
      setTranslation(nextTranslation);
      setVelocity(nextVelocity);
      setInterval(nextInterval);
      return;
    }

    const dist = Math.sqrt(
      nextTranslation.x * nextTranslation.x +
        nextTranslation.y * nextTranslation.y
    );

    if (dist <= MIN_DISTANCE) {
      setMovePoint(nextMovePoint);
      setMoveTime(nextMoveTime);
      return;
    }

    if (
      !shouldStart({
        target: evt.target,
        translation: nextTranslation,
        velocity: nextVelocity,
        interval: nextInterval,
      })
    ) {
      setStartPoint(null);
      setMovePoint(null);
      setMoveTime(null);
      return;
    }

    setTarget(evt.target);
    setStartPoint({ x: evt.pageX, y: evt.pageY });
    setMovePoint(nextMovePoint);
    setMoveTime(nextMoveTime);
    setTranslation({ x: 0, y: 0 });
    setVelocity(nextVelocity);
    setInterval(nextInterval);
  }, []);

  const end = useCallback(() => {
    setTarget(null);
    setStartPoint(null);
    setMovePoint(null);
    setMoveTime(null);
    setTranslation(null);
    setVelocity(null);
    setInterval(null);
  }, []);

  useEffect(() => {
    let touchSupported = false;

    function addTargetTouchListener(elem) {
      if (!elem.addEventListener) {
        return;
      }

      elem.addEventListener('touchmove', onTargetTouchMove, false);
      elem.addEventListener('touchend', onTargetTouchEnd, false);
      elem.addEventListener('touchcancel', onTargetTouchCancel, false);
    }

    function removeTargetTouchListener(elem) {
      if (!elem.removeEventListener) {
        return;
      }

      elem.removeEventListener('touchmove', onTargetTouchMove, false);
      elem.removeEventListener('touchend', onTargetTouchEnd, false);
      elem.removeEventListener('touchcancel', onTargetTouchCancel, false);
    }

    function onTouchStart(evt) {
      touchSupported = true;

      if (evt.touches && evt.touches.length === 1) {
        track(evt.touches[0]);
        addTargetTouchListener(evt.target);
      }
    }

    function onTouchMove(evt) {
      if (eventRef.current.target) {
        evt.preventDefault();
      }
    }

    function onTargetTouchMove(evt) {
      if (!eventRef.current.startPoint) {
        removeTargetTouchListener(evt.target);
        return;
      }

      if (eventRef.current.target) {
        evt.preventDefault();
      }

      move(evt.touches[0]);
    }

    function onTargetTouchEnd(evt) {
      removeTargetTouchListener(evt.target);

      if (eventRef.current.target) {
        evt.preventDefault();

        end();
      }
    }

    function onTargetTouchCancel(evt) {
      removeTargetTouchListener(evt.target);

      if (eventRef.current.target) {
        evt.preventDefault();

        end();
      }
    }

    function addRootMouseListener() {
      if (!root.addEventListener) {
        return;
      }

      root.addEventListener('mousemove', onRootMouseMove, false);
      root.addEventListener('mouseup', onRootMouseUp, false);
    }

    function removeRootMouseListener() {
      if (!root.removeEventListener) {
        return;
      }

      root.removeEventListener('mousemove', onRootMouseMove, false);
      root.removeEventListener('mouseup', onRootMouseUp, false);
    }

    function onMouseDown(evt) {
      if (touchSupported) {
        return;
      }

      track(evt);
      removeRootMouseListener();
      addRootMouseListener();
    }

    function onRootMouseMove(evt) {
      if (!eventRef.current.startPoint) {
        removeRootMouseListener();
        return;
      }

      evt.preventDefault();

      move(evt);
    }

    function onRootMouseUp(evt) {
      removeRootMouseListener();

      evt.preventDefault();

      if (eventRef.current.target) {
        end();
      }
    }

    function onClick(evt) {
      if (clickPrevented.current) {
        clickPrevented.current = false;
        evt.preventDefault();
        evt.stopImmediatePropagation();
      }
    }

    const elemNode = elemRef.current;

    if (enabled) {
      if (!elemNode.addEventListener) {
        return;
      }

      elemNode.addEventListener('touchstart', onTouchStart, false);
      elemNode.addEventListener('touchmove', onTouchMove, false);
      elemNode.addEventListener('mousedown', onMouseDown, false);
      elemNode.addEventListener('click', onClick, false);
    }

    return () => {
      if (!elemNode.removeEventListener) {
        return;
      }

      elemNode.removeEventListener('touchstart', onTouchStart, false);
      elemNode.removeEventListener('touchmove', onTouchMove, false);
      elemNode.removeEventListener('mousedown', onMouseDown, false);
      elemNode.removeEventListener('click', onClick, false);
    };
  }, [enabled, track, move, end]);

  useEffect(() => {
    const {
      target,
      translation,
      velocity,
      interval,
      onStart,
      onEnd,
      onCancel,
    } = eventRef.current;
    const data = { target, translation, velocity, interval };

    if (enabled) {
      if (target) {
        clickPrevented.current = true;

        if (onStart) {
          onStart(data);
        }
      } else {
        if (onEnd) {
          onEnd(data);
        }
      }
    } else {
      if (target) {
        end();
      } else {
        if (onCancel) {
          onCancel(data);
        }
      }
    }
  }, [enabled, target, end]);

  useEffect(() => {
    const {
      target,
      translation,
      velocity,
      interval,
      onMove,
    } = eventRef.current;
    const data = { target, translation, velocity, interval };

    if (onMove) {
      onMove(data);
    }
  }, [translation]);

  const elemStyle = {};

  if (enabled) {
    elemStyle.touchAction = 'none';
  }
  if (target) {
    elemStyle.userSelect = 'none';
  }

  props.style = {
    ...StyleSheet.create(elemStyle),
    ...props.style,
  };

  return <div {...props} ref={elemRef} />;
}
