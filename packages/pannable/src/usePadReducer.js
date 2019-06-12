import { useReducer } from 'react';
import {
  getAdjustedContentVelocity,
  getAdjustedContentOffset,
  getAdjustedBounceOffset,
  getDecelerationEndOffset,
  createDeceleration,
  calculateDeceleration,
} from './utils/motion';

const DECELERATION_RATE_STRONG = 0.025;
const DECELERATION_RATE_WEAK = 0.0025;

const initialState = {
  contentOffset: { x: 0, y: 0 },
  contentVelocity: { x: 0, y: 0 },
  drag: null,
  deceleration: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'validate':
      return validateReducer(state, action);
    case 'dragStart':
      return dragStartReducer(state, action);
    case 'dragMove':
      return dragMoveReducer(state, action);
    case 'dragEnd':
      return dragEndReducer(state, action);
    case 'dragCancel':
      return dragCancelReducer(state, action);
    case 'decelerate':
      return decelerateReducer(state, action);
    case 'setContentOffset':
      return setContentOffsetReducer(state, action);
    default:
      return state;
  }
}

function validateReducer(state, action) {
  const { contentOffset, contentVelocity, drag, deceleration } = state;
  const { size, contentSize, pagingEnabled } = action;

  const decelerationRate = DECELERATION_RATE_STRONG;

  if (deceleration) {
    let decelerationEndOffset = deceleration.endOffset;

    if (
      decelerationEndOffset !==
        getAdjustedContentOffset(
          decelerationEndOffset,
          size,
          contentSize,
          pagingEnabled,
          true
        ) &&
      contentOffset !==
        getAdjustedContentOffset(
          contentOffset,
          size,
          contentSize,
          pagingEnabled,
          true
        )
    ) {
      let nextContentVelocity = contentVelocity;

      if (deceleration.rate !== decelerationRate) {
        nextContentVelocity = getAdjustedContentVelocity(
          nextContentVelocity,
          size,
          decelerationRate
        );
        decelerationEndOffset = getDecelerationEndOffset(
          contentOffset,
          nextContentVelocity,
          size,
          pagingEnabled,
          decelerationRate
        );
      }

      decelerationEndOffset = getAdjustedContentOffset(
        decelerationEndOffset,
        size,
        contentSize,
        pagingEnabled,
        true
      );

      return {
        contentOffset,
        contentVelocity: nextContentVelocity,
        drag: null,
        deceleration: createDeceleration(
          contentOffset,
          nextContentVelocity,
          decelerationEndOffset,
          decelerationRate
        ),
      };
    }
  } else if (!drag) {
    const adjustedContentOffset = getAdjustedContentOffset(
      contentOffset,
      size,
      contentSize,
      pagingEnabled
    );

    if (contentOffset !== adjustedContentOffset) {
      const decelerationEndOffset = getDecelerationEndOffset(
        adjustedContentOffset,
        { x: 0, y: 0 },
        size,
        pagingEnabled,
        decelerationRate
      );

      return {
        contentOffset,
        contentVelocity,
        drag: null,
        deceleration: createDeceleration(
          contentOffset,
          contentVelocity,
          decelerationEndOffset,
          decelerationRate
        ),
      };
    }
  }

  return state;
}

function dragStartReducer(state, action) {
  const { contentOffset } = state;
  const { directionalLockEnabled, velocity } = action;

  const dragDirection = { x: 1, y: 1 };

  if (directionalLockEnabled) {
    if (Math.abs(velocity.x) > Math.abs(velocity.y)) {
      dragDirection.y = 0;
    } else {
      dragDirection.x = 0;
    }
  }

  const nextContentVelocity = {
    x: dragDirection.x * velocity.x,
    y: dragDirection.y * velocity.y,
  };

  return {
    contentOffset,
    contentVelocity: nextContentVelocity,
    drag: { direction: dragDirection, startOffset: contentOffset },
    deceleration: null,
  };
}

function dragMoveReducer(state, action) {
  const { contentOffset, drag } = state;
  const {
    alwaysBounceX,
    alwaysBounceY,
    size,
    contentSize,
    translation,
    interval,
  } = action;

  const nextContentOffset = getAdjustedBounceOffset(
    {
      x: drag.startOffset.x + drag.direction.x * translation.x,
      y: drag.startOffset.y + drag.direction.y * translation.y,
    },
    { x: alwaysBounceX, y: alwaysBounceY },
    size,
    contentSize
  );
  const nextContentVelocity = {
    x: (nextContentOffset.x - contentOffset.x) / interval,
    y: (nextContentOffset.y - contentOffset.y) / interval,
  };

  return {
    contentOffset: nextContentOffset,
    contentVelocity: nextContentVelocity,
    drag,
    deceleration: null,
  };
}

function dragEndReducer(state, action) {
  const { contentOffset, contentVelocity } = state;
  const { pagingEnabled, size } = action;

  let decelerationRate = DECELERATION_RATE_WEAK;
  let nextContentVelocity = contentVelocity;

  if (pagingEnabled) {
    decelerationRate = DECELERATION_RATE_STRONG;
    nextContentVelocity = getAdjustedContentVelocity(
      nextContentVelocity,
      size,
      decelerationRate
    );
  }

  const decelerationEndOffset = getDecelerationEndOffset(
    contentOffset,
    nextContentVelocity,
    size,
    pagingEnabled,
    decelerationRate
  );

  return {
    contentOffset,
    contentVelocity: nextContentVelocity,
    drag: null,
    deceleration: createDeceleration(
      contentOffset,
      nextContentVelocity,
      decelerationEndOffset,
      decelerationRate
    ),
  };
}

function dragCancelReducer(state, action) {
  const { contentOffset, contentVelocity, drag } = state;
  const { pagingEnabled, size } = action;

  const decelerationRate = DECELERATION_RATE_STRONG;
  const decelerationEndOffset = getDecelerationEndOffset(
    drag.startOffset,
    { x: 0, y: 0 },
    size,
    pagingEnabled,
    decelerationRate
  );

  return {
    contentOffset,
    contentVelocity,
    drag: null,
    deceleration: createDeceleration(
      contentOffset,
      contentVelocity,
      decelerationEndOffset,
      decelerationRate
    ),
  };
}

function decelerateReducer(state, action) {
  const { deceleration } = state;
  const { now: moveTime } = action;

  if (!deceleration) {
    return state;
  }
  if (deceleration.startTime + deceleration.duration <= moveTime) {
    return {
      contentOffset: deceleration.endOffset,
      contentVelocity: { x: 0, y: 0 },
      drag: null,
      deceleration: null,
    };
  }

  const { xOffset, yOffset, xVelocity, yVelocity } = calculateDeceleration(
    deceleration,
    moveTime
  );

  return {
    contentOffset: { x: xOffset, y: yOffset },
    contentVelocity: { x: xVelocity, y: yVelocity },
    drag: null,
    deceleration,
  };
}

function setContentOffsetReducer(state, action) {
  const { contentOffset, contentVelocity, size, drag, deceleration } = state;
  const { offset, animated, pagingEnabled } = action;

  if (drag || !animated) {
    if (offset.x === contentOffset.x && offset.y === contentOffset.y) {
      return state;
    }

    const nextState = { ...state, contentOffset: offset };

    if (drag) {
      nextState.drag = {
        ...drag,
        startOffset: {
          x: drag.startOffset.x + offset.x - contentOffset.x,
          y: drag.startOffset.y + offset.y - contentOffset.y,
        },
      };
    }
    if (deceleration) {
      nextState.deceleration = createDeceleration(
        offset,
        contentVelocity,
        {
          x: deceleration.endOffset.x + offset.x - contentOffset.x,
          y: deceleration.endOffset.y + offset.y - contentOffset.y,
        },
        deceleration.rate
      );
    }

    return nextState;
  }

  const decelerationEndOffset = getDecelerationEndOffset(
    offset,
    { x: 0, y: 0 },
    size,
    pagingEnabled,
    DECELERATION_RATE_STRONG
  );

  return {
    contentOffset,
    contentVelocity,
    drag: null,
    deceleration: createDeceleration(
      contentOffset,
      contentVelocity,
      decelerationEndOffset,
      DECELERATION_RATE_STRONG
    ),
  };
}

export default function() {
  return useReducer(reducer, initialState);
}
