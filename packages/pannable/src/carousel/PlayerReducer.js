import { initialState as padInitialState } from '../padReducer';

export const initialState = {
  mouseEntered: false,
  loopCount: 1,
  loopOffset: 1,
  scrollTo: null,
  padState: padInitialState,
};

export function reducer(state, action) {
  switch (action.type) {
    case 'setMouseEntered':
      return setMouseEnteredReducer(state, action);
    case 'updateLoopCount':
      return updateLoopCountReducer(state, action);
    case 'setLoopOffset':
      return setLoopOffsetReducer(state, action);
    case 'disableLoop':
      return disableLoopReducer(state, action);
    case 'setScrollTo':
      return setScrollToReducer(state, action);
    case 'setPadState':
      return setPadStateReducer(state, action);
    default:
      return state;
  }
}

function setMouseEnteredReducer(state, action) {
  return { ...state, mouseEntered: action.value };
}

function updateLoopCountReducer(state, action) {
  const { loopCount, loopOffset } = action;
  return { ...state, loopCount, loopOffset };
}

function setLoopOffsetReducer(state, action) {
  return { ...state, loopOffset: action.value };
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

function setScrollToReducer(state, action) {
  const { offset, animated } = action;
  return { ...state, scrollTo: { offset, animated } };
}

function setPadStateReducer(state, action) {
  return { ...state, padState: action.pad };
}
