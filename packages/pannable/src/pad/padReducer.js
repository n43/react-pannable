import { initialPannableState } from '../pannableReducer';
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

export const initialPadState = {
  contentOffset: { x: 0, y: 0 },
  contentVelocity: { x: 0, y: 0 },
  drag: null,
  deceleration: null,
  size: { width: 0, height: 0 },
  contentSize: { width: 0, height: 0 },
  pannable: initialPannableState,
  alwaysBounce: { x: true, y: true },
  isBoundless: { x: false, y: false },
  pagingEnabled: false,
  directionalLockEnabled: false,
};

export function reducer(state, action) {
  switch (action.type) {
    case 'syncProps':
      return validateReducer(syncPropsReducer(state, action), action);
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
    default:
      return state;
  }
}

function syncPropsReducer(state, action) {
  return {
    ...state,
    ...action.props,
  };
}

function validateReducer(state, action) {
  const {
    contentOffset,
    contentVelocity,
    drag,
    deceleration,
    size,
    contentSize,
    pagingEnabled,
    alwaysBounce,
    isBoundless,
  } = state;

  const decelerationRate = DECELERATION_RATE_STRONG;

  if (deceleration) {
    let decelerationEndOffset = deceleration.endOffset;
    const adjustedContentOffset = getAdjustedContentOffset(
      contentOffset,
      size,
      contentSize,
      isBoundless,
      pagingEnabled
    );
    const adjustedDecelerationEndOffset = getAdjustedContentOffset(
      decelerationEndOffset,
      size,
      contentSize,
      isBoundless,
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
        isBoundless,
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
          nextContentVelocity
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
      isBoundless,
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
          contentVelocity
        ),
      };
    }
  }

  return state;
}

function dragStartReducer(state, action) {
  const { contentOffset, directionalLockEnabled } = state;
  const { velocity } = state.pannable;

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
  const {
    contentOffset,
    drag,
    size,
    contentSize,
    alwaysBounce,
    isBoundless,
  } = state;
  const { translation, interval } = state.pannable;

  let nextContentOffset = {
    x: drag.startOffset.x + drag.direction.x * translation.x,
    y: drag.startOffset.y + drag.direction.y * translation.y,
  };

  nextContentOffset = getAdjustedBounceOffset(
    nextContentOffset,
    alwaysBounce,
    isBoundless,
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
  const { contentOffset, contentVelocity, size, pagingEnabled } = state;

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
      nextContentVelocity
    ),
  };
}

function dragCancelReducer(state, action) {
  const { contentOffset, contentVelocity, drag, size, pagingEnabled } = state;

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
      nextContentVelocity
    ),
  };
}

function decelerateReducer(state, action) {
  const { deceleration } = state;

  if (!deceleration) {
    return state;
  }

  const { offset, velocity, didEnd } = calculateDeceleration(deceleration);

  return {
    ...state,
    contentOffset: offset,
    contentVelocity: velocity,
    drag: null,
    deceleration: didEnd ? null : deceleration,
  };
}

function scrollToReducer(state, action) {
  const { drag, contentOffset, size } = state;
  const {
    offset = { x: 0, y: 0 },
    point,
    rect,
    align,
    animated,
  } = action.value;
  let nextRect = rect;
  const nextAnimated = drag ? false : animated;

  if (!nextRect) {
    if (point) {
      nextRect = { ...point, width: 0, height: 0 };
    } else {
      nextRect = { x: -offset.x, y: -offset.y, width: 0, height: 0 };
    }
  }

  const nextOffset = calculateOffsetForRect(
    nextRect,
    align,
    contentOffset,
    size
  );

  return setContentOffsetReducer(state, {
    type: 'setContentOffset',
    offset: nextOffset,
    animated: nextAnimated,
  });
}

function setContentOffsetReducer(state, action) {
  const {
    contentOffset,
    contentVelocity,
    drag,
    deceleration,
    size,
    pagingEnabled,
  } = state;
  const { offset, animated } = action;

  if (!animated) {
    if (drag) {
      return {
        ...state,
        contentOffset: offset,
        drag: {
          ...drag,
          startOffset: {
            x: drag.startOffset.x + offset.x - contentOffset.x,
            y: drag.startOffset.y + offset.y - contentOffset.y,
          },
        },
        deceleration: null,
      };
    }
    if (deceleration) {
      const decelerationEndOffset = getDecelerationEndOffset(
        {
          x: deceleration.endOffset.x + offset.x - contentOffset.x,
          y: deceleration.endOffset.y + offset.y - contentOffset.y,
        },
        { x: 0, y: 0 },
        size,
        pagingEnabled,
        deceleration.rate
      );

      return {
        ...state,
        contentOffset: offset,
        drag: null,
        deceleration: createDeceleration(
          decelerationEndOffset,
          deceleration.rate,
          offset,
          contentVelocity
        ),
      };
    }

    return {
      ...state,
      contentOffset: offset,
    };
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
      decelerationEndOffset,
      DECELERATION_RATE_STRONG,
      contentOffset,
      contentVelocity
    ),
  };
}

function calculateOffsetForRect(rect, align, cOffset, size, name) {
  if (name) {
    const [x, width] = name === 'y' ? ['y', 'height'] : ['x', 'width'];

    let offsetX = -rect[x];
    let alignX = align[x];
    const delta = size[width] - rect[width];

    if (alignX === 'auto') {
      const direction = delta < 0 ? -1 : 1;
      const dOffsetX = cOffset[x] - offsetX;

      offsetX +=
        direction *
        Math.max(0, Math.min(direction * dOffsetX, direction * delta));
    } else {
      if (alignX === 'start') {
        alignX = 0;
      } else if (alignX === 'center') {
        alignX = 0.5;
      } else if (alignX === 'end') {
        alignX = 1;
      } else if (typeof alignX !== 'number' || isNaN(alignX)) {
        alignX = 0;
      }

      offsetX += alignX * delta;
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
