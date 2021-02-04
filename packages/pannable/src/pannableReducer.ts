import { Action, Point, Time } from './interfaces';
import { Reducer } from 'react';

const MIN_DISTANCE = 0;

export type PannableState = {
  enabled: boolean;
  target: null | EventTarget;
  translation: null | Point;
  velocity: null | Point;
  interval: null | number;
  startPoint: Point;
  movePoint: Point;
  moveTime: Time;
};

export type PannableEvent = {
  target: EventTarget;
  translation: Point;
  velocity: Point;
  interval: number;
};

export const initialPannableState: PannableState = {
  enabled: false,
  target: null,
  translation: null,
  velocity: null,
  interval: null,
  startPoint: { x: 0, y: 0 },
  movePoint: { x: 0, y: 0 },
  moveTime: 0,
};

const reducer: Reducer<PannableState, Action> = (state, action) => {
  switch (action.type) {
    case 'setEnabled':
      return setEnabledReducer(state, action);
    case 'end':
      return endReducer(state, action);
    case 'track':
      return trackReducer(state, action);
    case 'move':
      return moveReducer(state, action);
    default:
      return state;
  }
};

export default reducer;

const setEnabledReducer: Reducer<PannableState, Action> = (state, action) => {
  const { enabled } = action.payload;

  if (!enabled) {
    return initialPannableState;
  }

  return {
    ...state,
    enabled,
  };
};

const endReducer: Reducer<PannableState, Action<any>> = (state, action) => {
  const { target } = state;

  if (!target) {
    return state;
  }

  return {
    ...state,
    target: null,
    translation: null,
    velocity: null,
    interval: null,
  };
};

const trackReducer: Reducer<PannableState, Action> = (state, action) => {
  const { target, point } = action.payload;
  const moveTime = new Date().getTime();

  return {
    ...state,
    target,
    startPoint: point,
    movePoint: point,
    moveTime,
    translation: null,
    velocity: null,
    interval: null,
  };
};

const moveReducer: Reducer<PannableState, Action> = (state, action) => {
  const { point: nextMovePoint, shouldStart } = action.payload;
  const { target, startPoint, movePoint, moveTime, translation } = state;

  if (!target) {
    return state;
  }

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

  /* on moving */
  if (translation) {
    return {
      ...state,
      target,
      translation: nextTranslation,
      velocity: nextVelocity,
      interval: nextInterval,
      startPoint,
      movePoint: nextMovePoint,
      moveTime: nextMoveTime,
    };
  }

  const dist = Math.sqrt(
    Math.pow(nextTranslation.x, 2) + Math.pow(nextTranslation.y, 2)
  );

  /* not started yet  */
  if (
    dist <= MIN_DISTANCE ||
    !shouldStart({
      target,
      translation: nextTranslation,
      velocity: nextVelocity,
      interval: nextInterval,
    })
  ) {
    return {
      ...state,
      target,
      translation: null,
      velocity: null,
      interval: null,
      startPoint,
      movePoint: nextMovePoint,
      moveTime: nextMoveTime,
    };
  }

  /* start moving */
  return {
    ...state,
    target,
    translation: { x: 0, y: 0 },
    velocity: nextVelocity,
    interval: nextInterval,
    startPoint: nextMovePoint,
    movePoint: nextMovePoint,
    moveTime: nextMoveTime,
  };
};
