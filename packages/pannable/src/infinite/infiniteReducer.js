import { initialState as padInitialState } from '../padReducer';

export const initialState = {
  scrollToRect: null,
  scrolling: false,
  pad: padInitialState,
};

export function reducer(state, action) {
  switch (action.type) {
    case 'setPad':
      return setPadReducer(state, action);
    case 'setScrollToRect':
      return setScrollToRectReducer(state, action);
    case 'scrollToIndex':
      return scrollToIndexReducer(state, action);
    case 'endScrolling':
      return endScrollingReducer(state, action);
    default:
      return state;
  }
}

function setPadReducer(state, action) {
  return {
    ...state,
    pad: action.value,
  };
}

function setScrollToRectReducer(state, action) {
  return {
    ...state,
    scrollToRect: action.value,
  };
}

function scrollToIndexReducer(state, action) {
  const { list, index = 0, align, animated } = action;
  const attrs = list.layoutList[index + 1];

  if (!attrs) {
    return state;
  }

  return {
    ...state,
    scrollToRect: { rect: attrs.rect, align, animated },
    scrolling: true,
  };
}

function endScrollingReducer(state, action) {
  return {
    ...state,
    scrolling: false,
  };
}
