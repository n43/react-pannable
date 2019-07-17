import { initialState as playerInitialState } from './playerReducer';

export const initialState = {
  pageIndex: 0,
  scrollTo: null,
  player: playerInitialState,
};

export function reducer(state, action) {
  switch (action.type) {
    case 'setPlayer':
      return setPlayerReducer(state, action);
    case 'setScrollTo':
      return setScrollToReducer(state, action);
    case 'slideTo':
      return slideToReducer(state, action);
    default:
      return state;
  }
}

function setPlayerReducer(state, action) {
  let nextState = { ...state, player: action.value };
  nextState = calculatePageIndexReducer(nextState);

  return nextState;
}

function setScrollToReducer(state, action) {
  return {
    ...state,
    scrollTo: action.value,
  };
}

function slideToReducer(state, action) {
  const { pageIndex } = state;
  const [direction, loop] = state.player.options;
  const { contentOffset, size } = state.player.pad;
  const { activeIndex, itemCount, animated } = action;
  let index = action.index;

  if (itemCount === 0) {
    return state;
  }
  if (typeof index === 'function') {
    index = index({ activeIndex, itemCount });
  }
  if (loop) {
    index += itemCount * Math.round((pageIndex - index) / itemCount);
  }

  if (index === pageIndex) {
    return state;
  }
  const offset = getContentOffsetAtIndex(index, contentOffset, size, direction);

  return { ...state, scrollTo: { offset, animated } };
}

function calculatePageIndexReducer(state) {
  const { pageIndex } = state;
  const [direction] = state.player.options;
  const { contentOffset, size, contentSize } = state.player.pad;
  const nextPageIndex = calculatePageIndex(
    contentOffset,
    size,
    contentSize,
    direction
  );

  if (nextPageIndex !== pageIndex) {
    return { ...state, pageIndex: nextPageIndex };
  }

  return state;
}

function calculatePageIndex(offset, size, cSize, direction) {
  const [width, x] = direction === 'y' ? ['height', 'y'] : ['width', 'x'];
  const sizeWidth = size[width];
  let index = 0;

  if (sizeWidth > 0) {
    const minOffsetX = Math.min(sizeWidth - cSize[width], 0);
    const offsetX = Math.max(minOffsetX, Math.min(offset[x], 0));

    index = Math.round(-offsetX / sizeWidth);
  }

  return index;
}

function getContentOffsetAtIndex(index, offset, size, direction) {
  const [width, x, y] =
    direction === 'y' ? ['height', 'y', 'x'] : ['width', 'x', 'y'];
  const sizeWidth = size[width];

  return { [x]: -index * sizeWidth, [y]: offset[y] };
}
