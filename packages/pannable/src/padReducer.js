import { initialState as pannableInitialState } from './pannableReducer';
import {
  getAdjustedContentVelocity,
  getAdjustedContentOffset,
  getAdjustedBounceOffset,
  getDecelerationEndOffset,
  createDeceleration,
  calculateDeceleration,
  calculateRectOffset,
} from './utils/motion';

const DECELERATION_RATE_STRONG = 0.025;
const DECELERATION_RATE_WEAK = 0.0025;

export const initialState = {
  pagingEnabled: false,
  size: { width: 0, height: 0 },
  contentSize: { width: 0, height: 0 },
  contentOffset: { x: 0, y: 0 },
  contentVelocity: { x: 0, y: 0 },
  drag: null,
  deceleration: null,
  pannable: pannableInitialState,
};

export function reducer(state, action) {
  if (action.type !== 'validate') {
    state = baseReducer(state, action);
  }

  return validateReducer(state, { type: 'validate' });
}

function baseReducer(state, action) {
  switch (action.type) {
    case 'setPannable':
      return setPannableReducer(state, action);
    case 'setPagingEnabled':
      return setPagingEnabledReducer(state, action);
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
    case 'setContentOffset':
      return setContentOffsetReducer(state, action);
    case 'scrollToRect':
      return scrollToRectReducer(state, action);
    default:
      return state;
  }
}

function validateReducer(state, action) {
  const {
    pagingEnabled,
    size,
    contentSize,
    contentOffset,
    contentVelocity,
    drag,
    deceleration,
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

function setPannableReducer(state, action) {
  return { ...state, pannable: action.value };
}

function setPagingEnabledReducer(state, action) {
  return { ...state, pagingEnabled: action.value };
}

function setContentSizeReducer(state, action) {
  return { ...state, contentSize: action.value };
}

function setSizeReducer(state, action) {
  return { ...state, size: action.value };
}

function dragStartReducer(state, action) {
  const { contentOffset, pannable } = state;
  const { directionalLockEnabled } = action;
  const { velocity } = pannable;

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
  const { size, contentSize, contentOffset, drag, pannable } = state;
  const { alwaysBounceX, alwaysBounceY } = action;
  const { translation, interval } = pannable;

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
  const { pagingEnabled, size, contentOffset, contentVelocity } = state;

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
  const { pagingEnabled, size, contentOffset, contentVelocity, drag } = state;

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
  const {
    pagingEnabled,
    size,
    contentOffset,
    contentVelocity,
    drag,
    deceleration,
  } = state;
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

function scrollToRectReducer(state, action) {
  const { contentOffset, size } = state;
  const { rect, align, animated } = action;
  const visibleRect = {
    x: -contentOffset.x,
    y: -contentOffset.y,
    width: size.width,
    height: size.height,
  };
  const offset = calculateRectOffset(rect, visibleRect, align);

  return setContentOffsetReducer(state, {
    type: 'setContentOffset',
    offset,
    animated,
  });
}
