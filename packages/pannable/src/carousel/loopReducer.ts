import { XY, WH, Point, Size, Action } from '../interfaces';
import { initialPadState, PadState, PadScrollTo } from '../pad/padReducer';
import { Reducer } from 'react';

export type LoopState = {
  loopCount: number;
  loopOffset: number;
  loopWidth: number;
  direction: XY;
  pad: PadState;
  scrollTo: PadScrollTo | null;
};

export const initialLoopState: LoopState = {
  loopCount: 2,
  loopOffset: 0,
  loopWidth: 0,
  direction: 'x',
  pad: initialPadState,
  scrollTo: null,
};

const reducer: Reducer<LoopState, Action> = (state, action) => {
  switch (action.type) {
    case 'setState':
      return validateReducer(setStateReducer(state, action), action);
    default:
      return state;
  }
};

export default reducer;

const setStateReducer: Reducer<LoopState, Action<Partial<LoopState>>> = (
  state,
  action
) => {
  return {
    ...state,
    ...action.payload,
  };
};

const validateReducer: Reducer<LoopState, Action> = (state) => {
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
};

function getAdjustedContentOffsetForLoop(
  offset: Point,
  size: Size,
  loopWidth: number,
  loopCount: number,
  direction: XY
): [Point, number] {
  if (loopCount === 1 || loopWidth === 0) {
    return [offset, 0];
  }

  const [width, x, y]: [WH, XY, XY] =
    direction === 'y' ? ['height', 'y', 'x'] : ['width', 'x', 'y'];

  const sizeWidth = size[width];
  const maxOffsetX = (sizeWidth - loopWidth * (loopCount - 1)) / 2;
  const minOffsetX = (sizeWidth - loopWidth * (loopCount + 1)) / 2;
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

  return [{ [x]: offsetX, [y]: offset[y] } as Point, delta];
}
