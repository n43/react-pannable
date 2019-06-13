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
  size: { width: 0, height: 0 },
  contentSize: { width: 0, height: 0 },
  contentOffset: { x: 0, y: 0 },
  contentVelocity: { x: 0, y: 0 },
  drag: null,
  deceleration: null,
};

function reducer(state, action) {
  switch (action.type) {
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
    case 'setContentSize':
      return setContentSizeReducer(state, action);
    case 'setSize':
      return setSizeReducer(state, action);
    case 'validate':
    default:
      return state;
  }
}

function didValidateReducer(state, action) {
  return validateReducer(reducer(state, action), action);
}

function validateReducer(state, action) {
  const {
    size,
    contentSize,
    contentOffset,
    contentVelocity,
    drag,
    deceleration,
  } = state;
  const { pagingEnabled } = action.props;

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
        ...state,
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
        ...state,
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
  const { directionalLockEnabled } = action.props;
  const { velocity } = action;

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
    ...state,
    contentVelocity: nextContentVelocity,
    drag: { direction: dragDirection, startOffset: contentOffset },
    deceleration: null,
  };
}

function dragMoveReducer(state, action) {
  const { size, contentSize, contentOffset, drag } = state;
  const { alwaysBounceX, alwaysBounceY } = action.props;
  const { translation, interval } = action;

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
    ...state,
    contentOffset: nextContentOffset,
    contentVelocity: nextContentVelocity,
    drag,
    deceleration: null,
  };
}

function dragEndReducer(state, action) {
  const { size, contentOffset, contentVelocity } = state;
  const { pagingEnabled } = action.props;

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
    ...state,
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
  const { size, contentOffset, contentVelocity, drag } = state;
  const { pagingEnabled } = action.props;

  const decelerationRate = DECELERATION_RATE_STRONG;
  const decelerationEndOffset = getDecelerationEndOffset(
    drag.startOffset,
    { x: 0, y: 0 },
    size,
    pagingEnabled,
    decelerationRate
  );

  return {
    ...state,
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
      ...state,
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
    ...state,
    contentOffset: { x: xOffset, y: yOffset },
    contentVelocity: { x: xVelocity, y: yVelocity },
    drag: null,
    deceleration,
  };
}

function setContentOffsetReducer(state, action) {
  const { size, contentOffset, contentVelocity, drag, deceleration } = state;
  const { pagingEnabled } = action.props;
  const { offset, animated } = action;

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
    ...state,
    drag: null,
    deceleration: createDeceleration(
      contentOffset,
      contentVelocity,
      decelerationEndOffset,
      DECELERATION_RATE_STRONG
    ),
  };
}

function setContentSizeReducer(state, action) {
  return { ...state, contentSize: action.size };
}

function setSizeReducer(state, action) {
  const { width, height } = action.props;

  return { ...state, size: { width, height } };
}

export default function() {
  return useReducer(didValidateReducer, initialState);
}
