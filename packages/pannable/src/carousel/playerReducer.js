import { initialPadState } from '../pad/padReducer';

export const initialState = {
  mouseEntered: false,
  loopCount: 1,
  loopOffset: 0,
  loopWidth: 0,
  scrollTo: null,
  /* direction, loop */
  options: ['x', true],
  pad: initialPadState,
};

export function reducer(state, action) {
  switch (action.type) {
    case 'setMouseEntered':
      return setMouseEnteredReducer(state, action);
    case 'setPad':
      return setPadReducer(state, action);
    case 'setOptions':
      return setOptionsReducer(state, action);
    case 'setScrollTo':
      return setScrollToReducer(state, action);
    case 'playNext':
      return playNextReducer(state, action);
    default:
      return state;
  }
}

function setMouseEnteredReducer(state, action) {
  return { ...state, mouseEntered: action.value };
}

function setPadReducer(state, action) {
  let nextState = { ...state, pad: action.value };
  nextState = validateReducer(nextState);
  nextState = calculateLoopCountReducer(nextState);

  return nextState;
}

function setOptionsReducer(state, action) {
  let nextState = { ...state, options: action.value };
  nextState = calculateLoopCountReducer(nextState);

  return nextState;
}

function setScrollToReducer(state, action) {
  return { ...state, scrollTo: action.value };
}

function playNextReducer(state, action) {
  const [direction] = state.options;
  const { contentOffset, size, contentSize, pagingEnabled } = state.pad;

  const offset = getContentOffsetForPlayNext(
    contentOffset,
    size,
    contentSize,
    pagingEnabled,
    direction
  );

  return { ...state, scrollTo: { offset, animated: true } };
}

function calculateLoopCountReducer(state, action) {
  const { loopCount } = state;
  const [direction, loop] = state.options;
  const { size, contentSize } = state.pad;

  return {
    ...state,
    ...calculateLoop(size, contentSize, loopCount, loop, direction),
  };
}

function validateReducer(state, action) {
  const { loopCount, loopOffset } = state;
  const [direction, loop] = state.options;
  const { contentOffset, size, contentSize } = state.pad;
  let nextState;

  if (loop) {
    const [adjustedContentOffset, delta] = getAdjustedContentOffsetForLoop(
      contentOffset,
      size,
      contentSize,
      loopCount,
      direction
    );

    if (contentOffset !== adjustedContentOffset) {
      nextState = nextState || { ...state };
      nextState.loopOffset = loopOffset + delta;
      nextState.scrollTo = { offset: adjustedContentOffset, animated: false };
    }
  }

  return nextState ? nextState : state;
}

function calculateLoop(size, contentSize, loopCount, loop, direction) {
  const width = direction === 'y' ? 'height' : 'width';

  const sizeWidth = size[width];
  const contentWidth = contentSize[width];
  const loopWidth = contentWidth / loopCount;

  if (!loop || contentWidth === 0 || sizeWidth === 0) {
    return { loopCount: 1, loopOffset: 0, loopWidth };
  }

  return { loopCount: 2 + Math.floor(sizeWidth / loopWidth), loopWidth };
}

function getAdjustedContentOffsetForLoop(
  offset,
  size,
  cSize,
  loopCount,
  direction
) {
  if (loopCount === 1) {
    return [offset, 0];
  }

  const [width, x, y] =
    direction === 'y' ? ['height', 'y', 'x'] : ['width', 'x', 'y'];

  const contentWidth = cSize[width];
  const sizeWidth = size[width];
  const itemWidth = contentWidth / loopCount;
  const bufferWidth = 0.5 * (contentWidth - itemWidth - sizeWidth);

  let maxOffsetX = 0;
  let minOffsetX = sizeWidth - contentWidth;
  let offsetX = offset[x];
  let delta = 0;

  maxOffsetX -= bufferWidth;
  minOffsetX += bufferWidth;

  if (minOffsetX <= offsetX && offsetX <= maxOffsetX) {
    return [offset, 0];
  }
  if (offsetX < minOffsetX) {
    delta = Math.floor((maxOffsetX - offsetX) / itemWidth);
  } else if (maxOffsetX < offsetX) {
    delta = -Math.floor((offsetX - minOffsetX) / itemWidth);
  }
  offsetX += itemWidth * delta;

  return [{ [x]: offsetX, [y]: offset[y] }, delta];
}

function getContentOffsetForPlayNext(
  offset,
  size,
  cSize,
  pagingEnabled,
  direction
) {
  const [width, x, y] =
    direction === 'y' ? ['height', 'y', 'x'] : ['width', 'x', 'y'];

  const sizeWidth = size[width];
  let minOffsetX = Math.min(sizeWidth - cSize[width], 0);
  let offsetX = offset[x];

  if (pagingEnabled && sizeWidth > 0) {
    minOffsetX = sizeWidth * Math.ceil(minOffsetX / sizeWidth);
  }

  if (minOffsetX < offsetX) {
    offsetX = Math.max(minOffsetX, offsetX - sizeWidth);
  } else {
    offsetX = 0;
  }

  return { [x]: offsetX, [y]: offset[y] };
}
