export const initialState = {
  loopCount: 2,
  loopOffset: 0,
  loopWidth: 0,
  scrollTo: null,
};

export function reducer(state, action) {
  switch (action.type) {
    case 'setScrollTo':
      return setScrollToReducer(state, action);
    case 'calculateLoop':
      return calculateLoopReducer(state, action);
    case 'validate':
      return validateReducer(state, action);
    default:
      return state;
  }
}

function setScrollToReducer(state, action) {
  return { ...state, scrollTo: action.value };
}

function calculateLoopReducer(state, action) {
  const { loopCount, loopWidth } = state;
  const { direction, size, contentSize } = action;

  const width = direction === 'y' ? 'height' : 'width';
  let nextLoopWidth = loopWidth;
  let nextLoopCount = 2;

  if (contentSize) {
    nextLoopWidth = contentSize[width] / loopCount;
  }

  if (nextLoopWidth !== 0) {
    nextLoopCount += Math.floor(size[width] / nextLoopWidth);
  }

  if (loopWidth === nextLoopWidth && loopCount === nextLoopCount) {
    return state;
  }

  return {
    ...state,
    loopCount: nextLoopCount,
    loopWidth: nextLoopWidth,
  };
}

function validateReducer(state, action) {
  const { loopCount, loopWidth, loopOffset } = state;
  const { direction, size, contentOffset } = action;

  const [adjustedContentOffset, delta] = getAdjustedContentOffsetForLoop(
    contentOffset,
    size,
    loopWidth,
    loopCount,
    direction
  );

  if (contentOffset !== adjustedContentOffset) {
    return {
      ...state,
      loopOffset: loopOffset + delta,
      scrollTo: { offset: adjustedContentOffset, animated: false },
    };
  }

  return state;
}

function getAdjustedContentOffsetForLoop(
  offset,
  size,
  loopWidth,
  loopCount,
  direction
) {
  if (loopCount === 1) {
    return [offset, 0];
  }

  const [width, x, y] =
    direction === 'y' ? ['height', 'y', 'x'] : ['width', 'x', 'y'];

  const sizeWidth = size[width];
  const maxOffsetX = 0.5 * (sizeWidth - loopWidth * (loopCount - 1));
  const minOffsetX = 0.5 * (sizeWidth - loopWidth * (loopCount + 1));
  let offsetX = offset[x];
  let delta = 0;

  if (minOffsetX <= offsetX && offsetX <= maxOffsetX) {
    return [offset, 0];
  }
  if (offsetX < minOffsetX) {
    delta = Math.floor((maxOffsetX - offsetX) / loopWidth);
  } else if (maxOffsetX < offsetX) {
    delta = -Math.floor((offsetX - minOffsetX) / loopWidth);
  }
  offsetX += loopWidth * delta;

  return [{ [x]: offsetX, [y]: offset[y] }, delta];
}
