import { initialState as padInitialState } from '../padReducer';

export const initialState = {
  mouseEntered: false,
  loopCount: 1,
  loopOffset: 1,
  scrollTo: null,
  pad: padInitialState,
};

export function reducer(state, action) {
  switch (action.type) {
    case 'setMouseEntered':
      return setMouseEnteredReducer(state, action);
    case 'disableLoop':
      return disableLoopReducer(state, action);
    case 'setScrollTo':
      return setScrollToReducer(state, action);
    case 'padScroll':
      return padScrollReducer(state, action);
    case 'padContentResize':
      return padContentResizeReducer(state, action);
    case 'setPad':
      return setPadReducer(state, action);
    default:
      return state;
  }
}

function setMouseEnteredReducer(state, action) {
  return { ...state, mouseEntered: action.value };
}

function disableLoopReducer(state) {
  if (state.loopCount === 1) {
    return state;
  }

  return {
    ...state,
    loopCount: 1,
    loopOffset: 0,
  };
}

function setScrollToReducer(state, action) {
  const { offset, animated } = action;
  return { ...state, scrollTo: { offset, animated } };
}

function padScrollReducer(state, action) {
  const { direction } = action;
  const { pad, loopCount, loopOffset } = state;
  const { contentOffset, size, contentSize } = pad;

  const [adjustedContentOffset, delta] = getAdjustedContentOffsetForLoop(
    contentOffset,
    size,
    contentSize,
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

function padContentResizeReducer(state, action) {
  const { direction } = action;
  const { pad, loopCount, loopOffset } = state;
  const { size, contentSize, contentOffset } = pad;

  let nextLoopCount = calculateLoopCount(
    size,
    contentSize,
    loopCount,
    direction
  );

  if (nextLoopCount !== loopCount) {
    return {
      ...state,
      loopCount: nextLoopCount,
      loopOffset: 0,
    };
  }

  const [adjustedContentOffset, delta] = getAdjustedContentOffsetForLoop(
    contentOffset,
    size,
    contentSize,
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

function setPadReducer(state, action) {
  return { ...state, pad: action.value };
}

function getAdjustedContentOffsetForLoop(
  contentOffset,
  size,
  contentSize,
  loopCount,
  direction
) {
  if (loopCount === 1) {
    return [contentOffset, 0];
  }

  const [width, x, y] =
    direction === 'y' ? ['height', 'y', 'x'] : ['width', 'x', 'y'];

  const contentWidth = contentSize[width];
  const sizeWidth = size[width];
  const itemWidth = contentWidth / loopCount;
  const bufferWidth = 0.5 * (itemWidth - sizeWidth);

  let maxOffsetX = 0;
  let minOffsetX = sizeWidth - contentWidth;
  let offsetX = contentOffset[x];
  let delta = 0;

  offsetX = maxOffsetX - ((maxOffsetX - offsetX) % (maxOffsetX - minOffsetX));

  maxOffsetX -= bufferWidth;
  minOffsetX += bufferWidth;

  if (offsetX < minOffsetX) {
    delta = loopCount - 1;
  } else if (maxOffsetX < offsetX) {
    delta = 1 - loopCount;
  }

  if (delta === 0) {
    return [contentOffset, 0];
  }

  offsetX += itemWidth * delta;

  return [{ [x]: offsetX, [y]: contentOffset[y] }, delta];
}

function calculateLoopCount(size, contentSize, loopCount, direction) {
  const width = direction === 'y' ? 'height' : 'width';

  const itemWidth = contentSize[width] / loopCount;
  const sizeWidth = size[width];

  if (!itemWidth || !sizeWidth) {
    return 1;
  }

  return 2 + Math.floor(sizeWidth / itemWidth);
}
