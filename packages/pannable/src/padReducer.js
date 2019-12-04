import { initialState as pannableInitialState } from './pannableReducer';
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

export const initialState = {
  size: { width: 0, height: 0 },
  contentSize: { width: 0, height: 0 },
  contentOffset: { x: 0, y: 0 },
  contentVelocity: { x: 0, y: 0 },
  drag: null,
  deceleration: null,
  /* pagingEnabled, directionalLockEnabled, alwaysBounceX, alwaysBounceY */
  options: [false, false, true, true],
  pannable: pannableInitialState,
};

export function reducer(state, action) {
  return validateReducer(baseReducer(state, action));
}

function baseReducer(state, action) {
  switch (action.type) {
    case 'setPannable':
      return setPannableReducer(state, action);
    case 'setOptions':
      return setOptionsReducer(state, action);
    case 'setSize':
      return setSizeReducer(state, action);
    case 'setContentSize':
      return setContentSizeReducer(state, action);
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
    case 'scrollTo':
      return scrollToReducer(state, action);
    case 'scrollToRect':
      return scrollToRectReducer(state, action);
    default:
      return state;
  }
}

function validateReducer(state, action) {
  const {
    size,
    contentSize,
    contentOffset,
    contentVelocity,
    drag,
    deceleration,
    options: [pagingEnabled],
  } = state;

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
          decelerationEndOffset,
          decelerationRate,
          contentOffset,
          nextContentVelocity
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

function setPannableReducer(state, action) {
  return { ...state, pannable: action.value };
}

function setOptionsReducer(state, action) {
  return { ...state, options: action.value };
}

function setContentSizeReducer(state, action) {
  return { ...state, contentSize: action.value };
}

function setSizeReducer(state, action) {
  return { ...state, size: action.value };
}

function dragStartReducer(state, action) {
  const {
    contentOffset,
    options: [, directionalLockEnabled],
    pannable: { velocity },
  } = state;

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
    size,
    contentSize,
    contentOffset,
    drag,
    options: [, , alwaysBounceX, alwaysBounceY],
    pannable: { translation, interval },
  } = state;

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
  const {
    size,
    contentOffset,
    contentVelocity,
    options: [pagingEnabled],
  } = state;

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
      decelerationEndOffset,
      decelerationRate,
      contentOffset,
      nextContentVelocity
    ),
  };
}

function dragCancelReducer(state, action) {
  const {
    size,
    contentOffset,
    contentVelocity,
    drag,
    options: [pagingEnabled],
  } = state;

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
      decelerationEndOffset,
      decelerationRate,
      contentOffset,
      contentVelocity
    ),
  };
}

function decelerateReducer(state, action) {
  const { deceleration } = state;
  const { now: moveTime } = action;

  if (!deceleration) {
    return state;
  }

  const {
    offset: contentOffset,
    velocity: contentVelocity,
    didEnd,
  } = calculateDeceleration(deceleration, moveTime);

  return {
    ...state,
    contentOffset,
    contentVelocity,
    drag: null,
    deceleration: didEnd ? null : deceleration,
  };
}

function scrollToReducer(state, action) {
  const {
    size,
    contentOffset,
    contentVelocity,
    options: [pagingEnabled],
  } = state;
  const { point } = action;
  let { drag, deceleration } = state;
  let { offset = { x: 0, y: 0 }, animated } = action;

  if (point) {
    offset = { x: -point.x, y: -point.y };
  }
  if (offset.x === contentOffset.x && offset.y === contentOffset.y) {
    return state;
  }
  if (drag) {
    animated = false;
  }

  if (!animated) {
    if (drag) {
      drag = {
        ...drag,
        startOffset: {
          x: drag.startOffset.x + offset.x - contentOffset.x,
          y: drag.startOffset.y + offset.y - contentOffset.y,
        },
      };
    }
    if (deceleration) {
      deceleration = createDeceleration(
        {
          x: deceleration.endOffset.x + offset.x - contentOffset.x,
          y: deceleration.endOffset.y + offset.y - contentOffset.y,
        },
        deceleration.rate,
        offset,
        contentVelocity
      );
    } else {
      deceleration = createDeceleration(offset);
    }

    return {
      ...state,
      contentOffset: offset,
      drag,
      deceleration,
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
    deceleration: createDeceleration(
      decelerationEndOffset,
      DECELERATION_RATE_STRONG,
      contentOffset,
      contentVelocity
    ),
  };
}

function scrollToRectReducer(state, action) {
  const { contentOffset, size } = state;
  const { rect, align, animated } = action;
  const offset = getContentOffsetForRect(rect, align, contentOffset, size);

  return scrollToReducer(state, {
    type: 'scrollTo',
    offset,
    animated,
  });
}

function getContentOffsetForRect(rect, align, cOffset, size, name) {
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
    x: getContentOffsetForRect(rect, align, cOffset, size, 'x'),
    y: getContentOffsetForRect(rect, align, cOffset, size, 'y'),
  };
}
