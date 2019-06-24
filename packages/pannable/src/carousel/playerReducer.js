import { initialState as padInitialState } from '../padReducer';

export const initialState = {
  mouseEntered: false,

  activeIndex: 0,
  loopCount: 1,
  loopOffset: 1,
  scrollTo: null,
  direction: 'x',
  pad: padInitialState,
};

export function reducer(state, action) {
  switch (action.type) {
    case 'setMouseEntered':
      return setMouseEnteredReducer(state, action);
    case 'disableLoop':
      return disableLoopReducer(state, action);
    case 'goTo':
      return goToReducer(state, action);
    case 'setScrollTo':
      return setScrollToReducer(state, action);
    case 'padScroll':
      return padScrollReducer(state, action);
    case 'padContentResize':
      return padContentResizeReducer(state, action);
    case 'setDirection':
      return setDirectionReducer(state, action);
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

function goToReducer(state, action) {
  const { prev, next, index, animated } = action;
  const { loopCount, pad, direction, activeIndex } = state;
  const {
    contentOffset,
    size,
    contentSize,
    drag,
    deceleration,
    pagingEnabled,
  } = pad;
  let delta = 0;

  if (drag || deceleration) {
    return state;
  }

  if (prev) {
    delta = -1;
  } else if (next) {
    delta = 1;
  } else {
    delta = index - activeIndex;
  }

  const offset = getContentOffsetForPlayback(
    delta,
    contentOffset,
    size,
    contentSize,
    pagingEnabled,
    loopCount,
    direction
  );

  return { ...state, scrollTo: { offset, animated } };
}

function setScrollToReducer(state, action) {
  return {
    ...state,
    scrollTo: action.value,
  };
}

function padScrollReducer(state) {
  const { pad, loopCount, loopOffset, direction, activeIndex } = state;
  const { contentOffset, size, contentSize } = pad;
  const nextState = { ...state };
  let stateChanged = false;

  const [adjustedContentOffset, delta] = getAdjustedContentOffsetForLoop(
    contentOffset,
    size,
    contentSize,
    loopCount,
    direction
  );

  const nextActiveIndex = calculateActiveIndex(
    contentOffset,
    size,
    contentSize,
    loopCount,
    direction
  );

  if (activeIndex !== nextActiveIndex) {
    stateChanged = true;
    nextState.activeIndex = nextActiveIndex;
  }

  if (contentOffset !== adjustedContentOffset) {
    stateChanged = true;
    nextState.loopOffset = loopOffset + delta;
    nextState.scrollTo = { offset: adjustedContentOffset, animated: false };
  }

  if (stateChanged) {
    return nextState;
  }

  return state;
}

function padContentResizeReducer(state) {
  const { pad, loopCount, loopOffset, direction } = state;
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

function setDirectionReducer(state, action) {
  return { ...state, direction: action.value };
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

function getContentOffsetForPlayback(
  delta,
  contentOffset,
  size,
  contentSize,
  pagingEnabled,
  loopCount,
  direction
) {
  const [width, x, y] =
    direction === 'y' ? ['height', 'y', 'x'] : ['width', 'x', 'y'];

  const sizeWidth = size[width];
  let offsetX = contentOffset[x] - delta * sizeWidth;

  if (loopCount === 1) {
    let minOffsetX = Math.min(sizeWidth - contentSize[width], 0);

    if (pagingEnabled && sizeWidth > 0) {
      minOffsetX = sizeWidth * Math.ceil(minOffsetX / sizeWidth);
    }

    if (offsetX < minOffsetX) {
      offsetX = minOffsetX - sizeWidth < offsetX ? minOffsetX : 0;
    } else if (0 < offsetX) {
      offsetX = offsetX < sizeWidth ? 0 : minOffsetX;
    }
  }

  return { [x]: offsetX, [y]: contentOffset[y] };
}

function calculateActiveIndex(offset, size, cSize, loopCount, direction) {
  const [width, x] = direction === 'y' ? ['height', 'y'] : ['width', 'x'];

  const offsetX = Math.min(Math.max(-cSize[width], offset[x]), 0);
  const index = Math.round(-offsetX / size[width]);
  const division = Math.floor(cSize[width] / (size[width] * loopCount));
  return index % division;
}
