import { initialState as playerInitialState } from './playerReducer';

export const initialState = {
  activeIndex: 0,
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
  nextState = calculateActiveIndexReducer(nextState);

  return nextState;
}

function setScrollToReducer(state, action) {
  return {
    ...state,
    scrollTo: action.value,
  };
}

function slideToReducer(state, action) {
  const { activeIndex } = state;
  const [direction] = state.player.options;
  const { contentOffset, size, contentSize } = state.player.pad;
  const { index, animated } = action;
  let delta = index;

  if (typeof delta === 'function') {
    delta = delta(activeIndex);
  }

  delta -= activeIndex;

  const offset = getContentOffsetForDelta(
    delta,
    contentOffset,
    size,
    contentSize,
    direction
  );

  return { ...state, scrollTo: { offset, animated } };
}

function calculateActiveIndexReducer(state) {
  const { activeIndex } = state;
  const { loopWidth } = state.player;
  const [direction] = state.player.options;
  const { contentOffset, size, contentSize } = state.player.pad;
  const nextActiveIndex = calculateActiveIndex(
    contentOffset,
    size,
    contentSize,
    loopWidth,
    direction
  );

  if (nextActiveIndex !== activeIndex) {
    return { ...state, activeIndex: nextActiveIndex };
  }

  return state;
}

function calculateActiveIndex(offset, size, cSize, loopWidth, direction) {
  const [width, x] = direction === 'y' ? ['height', 'y'] : ['width', 'x'];
  const sizeWidth = size[width];
  let index = 0;

  if (sizeWidth > 0 && loopWidth > 0) {
    const minOffsetX = Math.min(sizeWidth - cSize[width], 0);
    const offsetX = Math.max(minOffsetX, Math.min(offset[x], 0));
    const len = Math.round(loopWidth / sizeWidth);

    index = Math.round(-offsetX / sizeWidth);
    index = index % len;
  }

  return index;
}

function getContentOffsetForDelta(delta, offset, size, cSize, direction) {
  const [width, x, y] =
    direction === 'y' ? ['height', 'y', 'x'] : ['width', 'x', 'y'];
  const sizeWidth = size[width];
  let index = 0;

  if (sizeWidth > 0) {
    const minOffsetX = Math.min(sizeWidth - cSize[width], 0);
    const offsetX = Math.max(minOffsetX, Math.min(offset[x], 0));

    index = Math.round(-offsetX / sizeWidth);
  }

  return { [x]: -(index + delta) * sizeWidth, [y]: offset[y] };
}
