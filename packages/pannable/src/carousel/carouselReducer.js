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
      return validateReducer(syncPropsReducer(state, action), action);
    case 'scrollToIndex':
      return scrollToIndexReducer(state, action);
    case 'next':
      return nextReducer(state, action);
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
  const { direction, itemCount, activeIndex } = state;
  const { contentOffset, size } = state.pad;
  const nextActiveIndex = calculateActiveIndex(
    contentOffset,
    size,
    itemCount,
    direction
  );

  if (activeIndex !== nextActiveIndex) {
    return {
      ...state,
      activeIndex: nextActiveIndex,
    };
  }

  return state;
}

function scrollToIndexReducer(state, action) {
  const { activeIndex, itemCount, direction, loop } = state;
  const { contentOffset, size } = state.pad;
  const { animated } = action.value;
  let { index } = action.value;

  if (typeof index === 'function') {
    index = index({ activeIndex, itemCount });
  }

  if (!loop) {
    index = Math.max(0, Math.min(index, itemCount - 1));
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

function nextReducer(state, action) {
  const { activeIndex, itemCount, loop } = state;
  const { animated } = action;
  let nextActiveIndex = activeIndex + 1;

  if (!loop) {
    nextActiveIndex = nextActiveIndex % itemCount;
  }

  return scrollToIndexReducer(state, {
    value: { index: nextActiveIndex, animated },
  });
}

function calculateActiveIndex(offset, size, itemCount, direction) {
  const [width, x] = direction === 'y' ? ['height', 'y'] : ['width', 'x'];
  const sizeWidth = size[width];
  let index = 0;

  if (sizeWidth > 0) {
    index = Math.round(-offset[x] / sizeWidth);
  }

  return index % itemCount;
}

function getContentOffsetForIndexOffset(indexOffset, offset, size, direction) {
  const [width, x, y] =
    direction === 'y' ? ['height', 'y', 'x'] : ['width', 'x', 'y'];
  const sizeWidth = size[width];

  return { [x]: offset[x] - indexOffset * sizeWidth, [y]: offset[y] };
}
