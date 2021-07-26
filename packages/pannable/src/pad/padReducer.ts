import {
  XY,
  Point,
  Size,
  Rect,
  Align,
  Time,
  Bound,
  Action,
  Inset,
} from '../interfaces';
import { initialPannableState, PannableState } from '../pannableReducer';
import {
  getAdjustedContentVelocity,
  getAdjustedContentOffset,
  getAdjustedBounceOffset,
  getDecelerationEndOffset,
  calculateOffsetForRect,
} from '../utils/motion';
import { Reducer } from 'react';

const DECELERATION_RATE_STRONG = 0.025;
const DECELERATION_RATE_WEAK = 0.0025;

export type Deceleration = {
  endOffset: Point;
  rate: number;
  duration: number;
  startTime: Time;
  points: Record<XY, number[]>;
};

export type Drag = {
  startOffset: Point;
  direction: Point;
};

export type PadScrollTo = {
  offset?: Point;
  point?: Point;
  rect?: Rect;
  align?: Record<XY, Align> | Align;
  animated?: boolean;
};

export type PadEvent = {
  size: Size;
  contentSize: Size;
  contentOffset: Point;
  contentVelocity: Point;
  dragging: boolean;
  decelerating: boolean;
};

export type PadMethods = {
  _scrollTo: (params: PadScrollTo) => void;
};

export type PadState = {
  contentInset: Inset;
  contentOffset: Point;
  contentVelocity: Point;
  drag: Drag | null;
  deceleration: Deceleration | null;
  size: Size;
  contentSize: Size;
  bound: Record<XY, Bound>;
  pagingEnabled: boolean;
  directionalLockEnabled: boolean;
  pannable: PannableState;
};

export const initialPadState: PadState = {
  contentInset: { top: 0, right: 0, bottom: 0, left: 0 },
  contentOffset: { x: 0, y: 0 },
  contentVelocity: { x: 0, y: 0 },
  drag: null,
  deceleration: null,
  size: { width: 0, height: 0 },
  contentSize: { width: 0, height: 0 },
  bound: { x: 1, y: 1 },
  pagingEnabled: false,
  directionalLockEnabled: false,
  pannable: initialPannableState,
};

const reducer: Reducer<PadState, Action> = (state, action) => {
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
};

export default reducer;

const syncPropsReducer: Reducer<PadState, Action> = (state, action) => {
  return {
    ...state,
    ...action.payload.props,
  };
};

const validateReducer: Reducer<PadState, Action> = (state, action) => {
  const {
    contentOffset,
    contentVelocity,
    drag,
    deceleration,
    size,
    contentSize,
    pagingEnabled,
    bound,
  } = state;

  const decelerationRate = DECELERATION_RATE_STRONG;

  if (deceleration) {
    let decelerationEndOffset = deceleration.endOffset;
    const adjustedContentOffset = getAdjustedContentOffset(
      contentOffset,
      size,
      contentSize,
      bound,
      pagingEnabled
    );
    const adjustedDecelerationEndOffset = getAdjustedContentOffset(
      decelerationEndOffset,
      size,
      contentSize,
      bound,
      pagingEnabled
    );

    if (
      decelerationEndOffset !== adjustedDecelerationEndOffset &&
      contentOffset !== adjustedContentOffset
    ) {
      let nextContentOffset = contentOffset;
      let nextContentVelocity = getAdjustedContentVelocity(contentVelocity);

      if (bound.x === 0) {
        nextContentVelocity = { ...nextContentVelocity, x: 0 };
        nextContentOffset = {
          ...nextContentOffset,
          x: adjustedContentOffset.x,
        };
      }
      if (bound.y === 0) {
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
        bound,
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
      bound,
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
};

const dragStartReducer: Reducer<PadState, Action> = (state, action) => {
  const { contentOffset, directionalLockEnabled } = state;
  const { velocity } = state.pannable;

  if (!velocity) {
    return state;
  }

  const dragDirection: Point = { x: 1, y: 1 };

  if (directionalLockEnabled) {
    if (Math.abs(velocity.x) > Math.abs(velocity.y)) {
      dragDirection.y = 0;
    } else {
      dragDirection.x = 0;
    }
  }

  const nextContentVelocity: Point = {
    x: dragDirection.x * velocity.x,
    y: dragDirection.y * velocity.y,
  };

  return {
    ...state,
    contentVelocity: nextContentVelocity,
    drag: { direction: dragDirection, startOffset: contentOffset },
    deceleration: null,
  };
};

const dragMoveReducer: Reducer<PadState, Action> = (state, action) => {
  const { contentOffset, drag, size, contentSize, bound } = state;
  const { translation, interval } = state.pannable;

  if (!drag || !translation || !interval) {
    return state;
  }

  let nextContentOffset: Point = {
    x: drag.startOffset.x + drag.direction.x * translation.x,
    y: drag.startOffset.y + drag.direction.y * translation.y,
  };

  nextContentOffset = getAdjustedBounceOffset(
    nextContentOffset,
    bound,
    size,
    contentSize
  );

  const nextContentVelocity: Point = {
    x: (nextContentOffset.x - contentOffset.x) / interval,
    y: (nextContentOffset.y - contentOffset.y) / interval,
  };

  return {
    ...state,
    contentOffset: nextContentOffset,
    contentVelocity: nextContentVelocity,
  };
};

const dragEndReducer: Reducer<PadState, Action> = (state, action) => {
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
};

const dragCancelReducer: Reducer<PadState, Action> = (state, action) => {
  const { contentOffset, contentVelocity, drag, size, pagingEnabled } = state;

  if (!drag) {
    return state;
  }

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
};

const decelerateReducer: Reducer<PadState, Action> = (state, action) => {
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
};

const scrollToReducer: Reducer<PadState, Action> = (state, action) => {
  const { drag, contentOffset, size } = state;
  const {
    offset = { x: 0, y: 0 },
    point,
    rect,
    align,
    animated,
  } = action.payload.value;
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
    payload: {
      offset: nextOffset,
      animated: nextAnimated,
    },
  });
};

const setContentOffsetReducer: Reducer<PadState, Action> = (state, action) => {
  const {
    contentOffset,
    contentVelocity,
    drag,
    deceleration,
    size,
    pagingEnabled,
  } = state;
  const { offset, animated } = action.payload;

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
};

export function calculateDeceleration(
  deceleration: Deceleration
): {
  offset: Point;
  velocity: Point;
  didEnd: boolean;
} {
  const { points, duration, startTime, endOffset } = deceleration;

  function calculate(x: XY, t: number): [number, number] {
    const [p0, p1, p2, p3] = points[x];
    const offsetX =
      p0 -
      3 * (p0 - p1) * t +
      3 * (p0 - 2 * p1 + p2) * Math.pow(t, 2) -
      (p0 - 3 * p1 + 3 * p2 - p3) * Math.pow(t, 3);
    const velocityX =
      (-3 * (p0 - p1) +
        6 * (p0 - 2 * p1 + p2) * t -
        3 * (p0 - 3 * p1 + 3 * p2 - p3) * Math.pow(t, 2)) /
      duration;

    return [offsetX, velocityX];
  }

  const moveTime = new Date().getTime();
  let time = 1;

  if (duration > 0) {
    time = (moveTime - startTime) / duration;
  }

  if (time < 0 || 1 <= time) {
    return {
      offset: endOffset,
      velocity: { x: 0, y: 0 },
      didEnd: true,
    };
  }

  const [xOffset, xVelocity] = calculate('x', time);
  const [yOffset, yVelocity] = calculate('y', time);

  return {
    offset: { x: xOffset, y: yOffset },
    velocity: { x: xVelocity, y: yVelocity },
    didEnd: false,
  };
}

export function createDeceleration(
  endOffset: Point,
  rate: number,
  startOffset: Point,
  startVelocity: Point
): Deceleration {
  const startTime = new Date().getTime();
  let duration = 0;

  if (rate <= 0) {
    throw new Error('Rate needs more than 0.');
  }

  const s = {
    x: endOffset.x - startOffset.x,
    y: endOffset.y - startOffset.y,
  };

  const sm = Math.sqrt(Math.pow(s.x, 2) + Math.pow(s.y, 2));
  let vm;

  if (sm) {
    vm = (startVelocity.x * s.x + startVelocity.y * s.y) / sm;

    let vh = Math.sqrt(0.5 * Math.pow(vm, 2) + rate * sm);
    let th = (vh - vm) / rate;

    if (th < 0) {
      vh = vm;
      th = 0;
    }

    duration = th + vh / rate;
  } else {
    vm = Math.sqrt(Math.pow(startVelocity.x, 2) + Math.pow(startVelocity.y, 2));
    duration = ((Math.sqrt(2) + 1) * vm) / rate;
  }

  const points = {
    x: [
      startOffset.x,
      startOffset.x + startVelocity.x * (duration / 3.0),
      endOffset.x,
      endOffset.x,
    ],
    y: [
      startOffset.y,
      startOffset.y + startVelocity.y * (duration / 3.0),
      endOffset.y,
      endOffset.y,
    ],
  };

  return { endOffset, rate, duration, startTime, points };
}
