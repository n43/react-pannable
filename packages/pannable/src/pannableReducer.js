const MIN_DISTANCE = 0;

export const initialState = {
  target: null,
  startPoint: null,
  movePoint: null,
  moveTime: null,
  translation: null,
  velocity: null,
  interval: null,
};

export function reducer(state, action) {
  switch (action.type) {
    case 'disable':
    case 'end':
      return disableReducer(state, action);
    case 'track':
      return trackReducer(state, action);
    case 'move':
      return moveReducer(state, action);
    default:
      return state;
  }
}

function disableReducer(state, action) {
  const { target } = state;

  if (!target) {
    return state;
  }

  return initialState;
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
  /* on moving */
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
      target,
      startPoint,
      movePoint: nextMovePoint,
      moveTime: nextMoveTime,
      translation: null,
      velocity: null,
      interval: null,
    };
  }

  /* start moving */

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
