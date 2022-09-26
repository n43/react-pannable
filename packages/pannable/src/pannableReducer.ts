import { Action, Point, Time } from './interfaces';
import { Reducer } from 'react';

export type PannableState = {
  target: null | EventTarget;
  translation: null | Point;
  velocity: Point;
  interval: number;
  startPoint: Point;
  movePoint: Point;
  moveTime: Time;
  cancelled: boolean;
};

export const initialPannableState: PannableState = {
  target: null,
  translation: null,
  velocity: { x: 0, y: 0 },
  interval: 0,
  startPoint: { x: 0, y: 0 },
  movePoint: { x: 0, y: 0 },
  moveTime: 0,
  cancelled: true,
};

const reducer: Reducer<PannableState, Action> = (state, action) => {
  switch (action.type) {
    case 'reset':
      return initialPannableState;
    case 'track':
      return trackReducer(state, action);
    case 'move':
      return moveReducer(state, action);
    case 'start':
      return startReducer(state, action);
    case 'end':
      return endReducer(state, action);
    default:
      return state;
  }
};

export default reducer;

const trackReducer: Reducer<
  PannableState,
  Action<{ target: EventTarget; point: Point }>
> = (state, action) => {
  const { target, point } = action.payload!;
  const moveTime = new Date().getTime();

  return {
    ...state,
    target,
    translation: null,
    velocity: { x: 0, y: 0 },
    interval: 0,
    startPoint: point,
    movePoint: point,
    moveTime,
  };
};

const moveReducer: Reducer<PannableState, Action> = (state, action) => {
  const { point: nextMovePoint } = action.payload!;
  const { target, startPoint, movePoint, moveTime, translation } = state;

  if (!target) {
    return state;
  }

  const nextMoveTime = new Date().getTime();
  const nextInterval = nextMoveTime - moveTime;
  const nextVelocity = {
    x: (nextMovePoint.x - movePoint.x) / nextInterval,
    y: (nextMovePoint.y - movePoint.y) / nextInterval,
  };

  if (!translation) {
    return {
      ...state,
      velocity: nextVelocity,
      interval: nextInterval,
      movePoint: nextMovePoint,
      moveTime: nextMoveTime,
    };
  }

  const nextTranslation = {
    x: nextMovePoint.x - startPoint.x,
    y: nextMovePoint.y - startPoint.y,
  };

  /* on moving */
  return {
    ...state,
    translation: nextTranslation,
    velocity: nextVelocity,
    interval: nextInterval,
    movePoint: nextMovePoint,
    moveTime: nextMoveTime,
  };
};

const startReducer: Reducer<PannableState, Action> = (state) => {
  const { target, translation, movePoint } = state;

  if (!target || translation) {
    return state;
  }

  return {
    ...state,
    translation: { x: 0, y: 0 },
    startPoint: movePoint,
    cancelled: true,
  };
};

const endReducer: Reducer<PannableState, Action> = (state) => {
  const { target } = state;

  if (!target) {
    return state;
  }

  return {
    ...state,
    target: null,
    translation: null,
    cancelled: false,
  };
};
