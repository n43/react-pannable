import { XY, WH, Point, Size, Action } from '../interfaces';
import { initialPadState, PadState, PadScrollTo } from '../pad/padReducer';
import { Reducer } from 'react';

export type CarouselEvent = {
  activeIndex: number;
  itemCount: number;
};

export type CarouselScrollTo = {
  index: number | ((evt: CarouselEvent) => number);
  animated: boolean;
};

export type CarouselMethods = {
  scrollToIndex: (params: CarouselScrollTo) => void;
  play: (playing: boolean) => void;
};

export type CarouselState = {
  pad: PadState;
  activeIndex: number;
  direction: XY;
  loop: boolean;
  itemCount: number;
  scrollTo: PadScrollTo | null;
  playing: boolean;
};

export const initialCarouselState: CarouselState = {
  pad: initialPadState,
  activeIndex: 0,
  direction: 'x',
  loop: true,
  itemCount: 0,
  scrollTo: null,
  playing: false,
};

const reducer: Reducer<CarouselState, Action> = (state, action) => {
  switch (action.type) {
    case 'setState':
      return validateReducer(setStateReducer(state, action), action);
    case 'scrollToIndex':
      return scrollToIndexReducer(state, action);
    case 'next':
      return nextReducer(state, action);
    case 'play':
      return playReducer(state, action);
    default:
      return state;
  }
};

export default reducer;

const setStateReducer: Reducer<
  CarouselState,
  Action<Partial<CarouselState>>
> = (state, action) => {
  return {
    ...state,
    ...action.payload,
  };
};

const validateReducer: Reducer<CarouselState, Action> = (state, action) => {
  const { direction, itemCount, activeIndex } = state;
  const { contentOffset, size } = state.pad;
  const nextActiveIndex = calculateActiveIndex(
    contentOffset,
    size,
    itemCount,
    direction
  );

  if (activeIndex === nextActiveIndex) {
    return state;
  }

  return {
    ...state,
    activeIndex: nextActiveIndex,
  };
};

const scrollToIndexReducer: Reducer<CarouselState, Action<CarouselScrollTo>> = (
  state,
  action
) => {
  const { activeIndex, itemCount, direction, loop } = state;
  const { contentOffset, size } = state.pad;
  const { animated } = action.payload!;
  let { index } = action.payload!;

  if (typeof index === 'function') {
    index = index({ activeIndex, itemCount });
  }

  if (!loop) {
    index = Math.max(0, Math.min(index, itemCount - 1));
  }

  const offset = getContentOffsetForIndexOffset(
    index - activeIndex,
    contentOffset,
    size,
    direction
  );

  return { ...state, scrollTo: { offset, animated } };
};

const nextReducer: Reducer<CarouselState, Action> = (state, action) => {
  const { activeIndex, itemCount, loop } = state;
  const { animated } = action.payload;
  let nextActiveIndex = activeIndex + 1;

  if (!loop) {
    nextActiveIndex = nextActiveIndex % itemCount;
  }

  return scrollToIndexReducer(state, {
    type: 'scrollToIndex',
    payload: { index: nextActiveIndex, animated },
  });
};

const playReducer: Reducer<CarouselState, Action<boolean>> = (
  state,
  action
) => {
  return {
    ...state,
    playing: action.payload!,
  };
};

function calculateActiveIndex(
  offset: Point,
  size: Size,
  itemCount: number,
  direction: XY
): number {
  const [width, x]: [WH, XY] =
    direction === 'y' ? ['height', 'y'] : ['width', 'x'];
  const sizeWidth = size[width];
  let index = 0;

  if (sizeWidth > 0) {
    index = Math.round(-offset[x] / sizeWidth);
  }

  return index % itemCount;
}

function getContentOffsetForIndexOffset(
  indexOffset: number,
  offset: Point,
  size: Size,
  direction: XY
): Point {
  const [width, x, y]: [WH, XY, XY] =
    direction === 'y' ? ['height', 'y', 'x'] : ['width', 'x', 'y'];
  const sizeWidth = size[width];

  return { [x]: offset[x] - indexOffset * sizeWidth, [y]: offset[y] } as Point;
}
