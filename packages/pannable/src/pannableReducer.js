const MIN_DISTANCE = 0;

export const initialPannableState = {
  enabled: false,
  target: null,
  startPoint: null,
  movePoint: null,
  moveTime: null,
  translation: null,
  velocity: null,
  interval: null,
};

export default function reducer(state, action) {
  switch (action.type) {
    case 'syncEnabled':
      return syncEnabledReducer(state, action);
    case 'end':
      return endReducer(state, action);
    case 'track':
      return trackReducer(state, action);
    case 'move':
      return moveReducer(state, action);
    default:
      return state;
  }
}

function syncEnabledReducer(state, action) {
  const { enabled } = action;

  if (!enabled) {
    return initialPannableState;
  }

  return {
    ...state,
    enabled,
  };
}

function endReducer(state, action) {
  const { target } = state;

  if (!target) {
    return state;
  }

  return {
    ...state,
    target: null,
    startPoint: null,
    movePoint: null,
    moveTime: null,
    translation: null,
    velocity: null,
    interval: null,
  };
}

function trackReducer(state, action) {
  const moveTime = new Date().getTime();

  return {
    ...state,
    target: action.target,
    startPoint: action.point,
    movePoint: action.point,
    moveTime,
    translation: null,
    velocity: null,
    interval: null,
  };
}

function moveReducer(state, action) {
  const { target, startPoint, movePoint, moveTime, translation } = state;
  const { point: nextMovePoint, shouldStart } = action;

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
      ...state,
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
    ...state,
    target,
    startPoint: nextMovePoint,
    movePoint: nextMovePoint,
    moveTime: nextMoveTime,
    translation: { x: 0, y: 0 },
    velocity: nextVelocity,
    interval: nextInterval,
  };
}
