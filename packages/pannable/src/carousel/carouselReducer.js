import { initialState as playerInitialState } from './playerReducer';

export const initialState = {
  activeIndex: 0,
  itemCount: 0,
  scrollTo: null,
  player: playerInitialState,
};

export function reducer(state, action) {
  switch (action.type) {
    case 'setPlayer':
      return setPlayerReducer(state, action);
    case 'setScrollTo':
      return setScrollToReducer(state, action);
    case 'scrollToIndex':
      return scrollToIndexReducer(state, action);
    default:
      return state;
  }
}

function setPlayerReducer(state, action) {
  const player = action.value;

  const { loopWidth } = player;
  const [direction] = player.options;
  const { contentOffset, size, contentSize } = player.pad;
  const itemCount = calculateItemCount(size, loopWidth, direction);
  let activeIndex = 0;

  if (itemCount > 0) {
    const pageIndex = calculatePageIndex(
      contentOffset,
      size,
      contentSize,
      direction
    );

    activeIndex = pageIndex % itemCount;
  }

  return { ...state, player, itemCount, activeIndex };
}

function setScrollToReducer(state, action) {
  return {
    ...state,
    scrollTo: action.value,
  };
}

function scrollToIndexReducer(state, action) {
  const { activeIndex, itemCount } = state;
  const [direction] = state.player.options;
  const { contentOffset, size } = state.player.pad;
  const { animated } = action;
  let { index } = action;

  if (itemCount === 0) {
    return state;
  }

  if (typeof index === 'function') {
    index = index(state);
  }

  if (index === activeIndex) {
    return state;
  }

  const offset = getContentOffsetForIndexOffset(
    index - activeIndex,
    contentOffset,
    size,
    direction
  );

  return { ...state, scrollTo: { offset, animated } };
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

function calculateItemCount(size, loopWidth, direction) {
  const width = direction === 'y' ? 'height' : 'width';
  const sizeWidth = size[width];
  let count = 0;

  if (sizeWidth > 0) {
    count = Math.ceil(loopWidth / sizeWidth);
  }

  return count;
}

function getContentOffsetForIndexOffset(indexOffset, offset, size, direction) {
  const [width, x, y] =
    direction === 'y' ? ['height', 'y', 'x'] : ['width', 'x', 'y'];
  const sizeWidth = size[width];

  return { [x]: offset[x] - indexOffset * sizeWidth, [y]: offset[y] };
}
