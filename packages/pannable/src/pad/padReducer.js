import {
  getAdjustedContentVelocity,
  getAdjustedContentOffset,
  getAdjustedBounceOffset,
  getDecelerationEndOffset,
  createDeceleration,
  calculateDeceleration,
} from '../utils/motion';

const DECELERATION_RATE_STRONG = 0.025;
const DECELERATION_RATE_WEAK = 0.0025;

export const initialState = {
  contentOffset: { x: 0, y: 0 },
  contentVelocity: { x: 0, y: 0 },
  drag: null,
  deceleration: null,
};

export function reducer(state, action) {
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
      return validateReducer(decelerateReducer(state, action), action);
    case 'scrollTo':
      return validateReducer(scrollToReducer(state, action), action);
    case 'scrollToRect':
      return validateReducer(scrollToRectReducer(state, action));
    default:
      return state;
  }
}

function validateReducer(state, action) {
  const { contentOffset, contentVelocity, drag, deceleration } = state;
  const { size, contentSize, pagingEnabled, alwaysBounce } = action.options;
  const { now } = action;

  const decelerationRate = DECELERATION_RATE_STRONG;

  if (deceleration) {
    let decelerationEndOffset = deceleration.endOffset;
    const adjustedContentOffset = getAdjustedContentOffset(
      contentOffset,
      size,
      contentSize,
      pagingEnabled
    );
    const adjustedDecelerationEndOffset = getAdjustedContentOffset(
      decelerationEndOffset,
      size,
      contentSize,
      pagingEnabled
    );

    if (
      decelerationEndOffset !== adjustedDecelerationEndOffset &&
      contentOffset !== adjustedContentOffset
    ) {
      let nextContentOffset = contentOffset;
      let nextContentVelocity = getAdjustedContentVelocity(contentVelocity);

      if (!alwaysBounce.x) {
        nextContentVelocity = { ...nextContentVelocity, x: 0 };
        nextContentOffset = {
          ...nextContentOffset,
          x: adjustedContentOffset.x,
        };
      }
      if (!alwaysBounce.y) {
        nextContentVelocity = { ...nextContentVelocity, y: 0 };
        nextContentOffset = {
          ...nextContentOffset,
          y: adjustedContentOffset.y,
        };
      }

      if (deceleration.rate !== decelerationRate) {
        decelerationEndOffset = getDecelerationEndOffset(
          nextContentOffset,
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
        pagingEnabled
      );

      return {
        ...state,
        contentOffset: nextContentOffset,
        contentVelocity: nextContentVelocity,
        drag: null,
        deceleration: createDeceleration(
          decelerationEndOffset,
          decelerationRate,
          nextContentOffset,
          nextContentVelocity,
          now
        ),
      };
    }
  } else if (!drag) {
    let decelerationEndOffset = getDecelerationEndOffset(
      contentOffset,
      contentVelocity,
      size,
      pagingEnabled,
      decelerationRate
    );

    decelerationEndOffset = getAdjustedContentOffset(
      decelerationEndOffset,
      size,
      contentSize,
      pagingEnabled
    );

    if (
      decelerationEndOffset.x !== contentOffset.x ||
      decelerationEndOffset.y !== contentOffset.y
    ) {
      return {
        ...state,
        drag: null,
        deceleration: createDeceleration(
          decelerationEndOffset,
          decelerationRate,
          contentOffset,
          contentVelocity,
          now
        ),
      };
    }
  }

  return state;
}

function dragStartReducer(state, action) {
  const { contentOffset } = state;
  const { velocity } = action.pannable;
  const { directionalLockEnabled } = action;

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
  const { contentOffset, drag } = state;
  const { size, contentSize, alwaysBounce } = action.options;
  const { translation, interval } = action.pannable;

  let nextContentOffset = {
    x: drag.startOffset.x + drag.direction.x * translation.x,
    y: drag.startOffset.y + drag.direction.y * translation.y,
  };

  nextContentOffset = getAdjustedBounceOffset(
    nextContentOffset,
    alwaysBounce,
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
  };
}

function dragEndReducer(state, action) {
  const { contentOffset, contentVelocity } = state;
  const { size, pagingEnabled } = action.options;
  const { now } = action;

  const decelerationRate = pagingEnabled
    ? DECELERATION_RATE_STRONG
    : DECELERATION_RATE_WEAK;
  const nextContentVelocity = getAdjustedContentVelocity(contentVelocity);

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
      decelerationEndOffset,
      decelerationRate,
      contentOffset,
      nextContentVelocity,
      now
    ),
  };
}

function dragCancelReducer(state, action) {
  const { contentOffset, contentVelocity, drag } = state;
  const { size, pagingEnabled } = action.options;
  const { now } = action;

  const decelerationRate = DECELERATION_RATE_STRONG;
  const nextContentVelocity = getAdjustedContentVelocity(contentVelocity);
  const decelerationEndOffset = getDecelerationEndOffset(
    drag.startOffset,
    { x: 0, y: 0 },
    size,
    pagingEnabled,
    decelerationRate
  );

  return {
    ...state,
    contentVelocity: nextContentVelocity,
    drag: null,
    deceleration: createDeceleration(
      decelerationEndOffset,
      decelerationRate,
      contentOffset,
      nextContentVelocity,
      now
    ),
  };
}

function decelerateReducer(state, action) {
  const { deceleration } = state;
  const { now } = action;

  if (!deceleration) {
    return state;
  }

  const { offset, velocity, didEnd } = calculateDeceleration(deceleration, now);

  return {
    ...state,
    contentOffset: offset,
    contentVelocity: velocity,
    drag: null,
    deceleration: didEnd ? null : deceleration,
  };
}

function scrollToReducer(state, action) {
  const { contentOffset, contentVelocity, drag, deceleration } = state;
  const { now } = action;
  const { offset = { x: 0, y: 0 }, point, animated } = action.value;
  const { size, pagingEnabled } = action.options;
  let nextOffset = offset;
  let nextAnimated = animated;

  if (point) {
    nextOffset = { x: -point.x, y: -point.y };
  }
  if (nextOffset.x === contentOffset.x && nextOffset.y === contentOffset.y) {
    return state;
  }
  if (drag) {
    nextAnimated = false;
  }

  if (!nextAnimated) {
    let nextDrag = drag;
    let nextDeceleration = deceleration;

    if (drag) {
      nextDrag = {
        ...drag,
        startOffset: {
          x: drag.startOffset.x + nextOffset.x - contentOffset.x,
          y: drag.startOffset.y + nextOffset.y - contentOffset.y,
        },
      };
    }
    if (deceleration) {
      const decelerationEndOffset = getDecelerationEndOffset(
        {
          x: deceleration.endOffset.x + nextOffset.x - contentOffset.x,
          y: deceleration.endOffset.y + nextOffset.y - contentOffset.y,
        },
        { x: 0, y: 0 },
        size,
        pagingEnabled,
        deceleration.rate
      );

      nextDeceleration = createDeceleration(
        decelerationEndOffset,
        deceleration.rate,
        nextOffset,
        contentVelocity,
        now
      );
    }

    return {
      ...state,
      contentOffset: nextOffset,
      drag: nextDrag,
      deceleration: nextDeceleration,
    };
  }

  const decelerationEndOffset = getDecelerationEndOffset(
    nextOffset,
    { x: 0, y: 0 },
    size,
    pagingEnabled,
    DECELERATION_RATE_STRONG
  );

  return {
    ...state,
    deceleration: createDeceleration(
      decelerationEndOffset,
      DECELERATION_RATE_STRONG,
      contentOffset,
      contentVelocity,
      now
    ),
  };
}

function scrollToRectReducer(state, action) {
  const { contentOffset } = state;
  const { rect, align } = action.value;
  const { size } = action.options;
  const offset = calculateOffsetForRect(rect, align, contentOffset, size);

  return scrollToReducer(state, { ...action, offset });
}

function calculateOffsetForRect(rect, align, cOffset, size, name) {
  if (name) {
    const [x, width] = name === 'y' ? ['y', 'height'] : ['x', 'width'];

    let offsetX = -rect[x];
    const delta = size[width] - rect[width];

    if (align[x] === 'auto') {
      const direction = delta < 0 ? -1 : 1;
      const dOffsetX = cOffset[x] - offsetX;

      offsetX +=
        direction *
        Math.max(0, Math.min(direction * dOffsetX, direction * delta));
    } else {
      if (align[x] === 'start') {
        align[x] = 0;
      } else if (align[x] === 'center') {
        align[x] = 0.5;
      } else if (align[x] === 'end') {
        align[x] = 1;
      }
      if (typeof align[x] !== 'number' || isNaN(align[x])) {
        align[x] = 0.5;
      }

      offsetX += align[x] * delta;
    }

    return offsetX;
  }

  if (typeof align !== 'object') {
    align = { x: align, y: align };
  }

  return {
    x: calculateOffsetForRect(rect, align, cOffset, size, 'x'),
    y: calculateOffsetForRect(rect, align, cOffset, size, 'y'),
  };
}
