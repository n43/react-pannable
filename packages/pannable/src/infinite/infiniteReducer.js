import { initialState as padInitialState } from '../padReducer';

export const initialState = {
  scrollTo: null,
  pad: padInitialState,
};

export function reducer(state, action) {
  switch (action.type) {
    case 'setPad':
      return setPadReducer(state, action);
    case 'setScrollTo':
      return setScrollToReducer(state, action);
    case 'scrollToIndex':
      return scrollToIndexReducer(state, action);
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

function setScrollToReducer(state, action) {
  return {
    ...state,
    scrollTo: action.value,
  };
}

function scrollToIndexReducer(state, action) {
  return state;
}
