import { initialPadState } from '../pad/padReducer';

export const initialLoopState = {
  loopCount: 2,
  loopOffset: 0,
  loopWidth: 0,
  scrollTo: null,
  pad: initialPadState,
  direction: 'x',
};

export function reducer(state, action) {
  switch (action.type) {
    case 'syncProps':
      return validateReducer(syncPropsReducer(state, action), action);
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
  const { loopCount, loopWidth, loopOffset, direction } = state;
  const { size, contentSize, contentOffset } = state.pad;

  const width = direction === 'y' ? 'height' : 'width';
  let nextLoopWidth = contentSize[width] / loopCount;
  let nextLoopCount = 2;

  if (nextLoopWidth !== 0) {
    nextLoopCount += Math.floor(size[width] / nextLoopWidth);
  }

  if (loopWidth !== nextLoopWidth || loopCount !== nextLoopCount) {
    return {
      ...state,
      loopCount: nextLoopCount,
      loopWidth: nextLoopWidth,
    };
  }

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
  if (loopCount === 1 || loopWidth === 0) {
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
