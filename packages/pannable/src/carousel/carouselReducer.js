import { initialPadState } from '../pad/padReducer';

export const initialCarouselState = {
  activeIndex: 0,
  scrollTo: null,
  pad: initialPadState,
  direction: 'x',
  loop: true,
  itemCount: 0,
};

export function reducer(state, action) {
  switch (action.type) {
    case 'syncProps':
      return syncPropsReducer(state, action);
    case 'scrollToIndex':
      return scrollToIndexReducer(state, action);
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
