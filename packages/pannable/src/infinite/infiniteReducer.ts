import { XY, Action, Align } from '../interfaces';
import { initialPadState, PadScrollTo, PadState } from '../pad/padReducer';
import { Reducer } from 'react';

export type InfiniteScrollTo = {
  index: number;
  align: Record<XY, Align> | Align;
  animated: boolean;
};

export type InfiniteState = {
  scroll: InfiniteScrollTo | null;
  scrollTo: PadScrollTo | null;
  pad: PadState;
};

export const initialInfiniteState: InfiniteState = {
  scroll: null,
  scrollTo: null,
  pad: initialPadState,
};

const reducer: Reducer<InfiniteState, Action> = (state, action) => {
  switch (action.type) {
    case 'syncProps':
      return syncPropsReducer(state, action);
    case 'scrollToIndex':
      return scrollToIndexReducer(state, action);
    case 'scrollEnd':
      return scrollEndReducer(state, action);
    case 'scrollRecalculate':
      return scrollRecalculateReducer(state, action);
    default:
      return state;
  }
};

export default reducer;

const syncPropsReducer: Reducer<InfiniteState, Action> = (state, action) => {
  return {
    ...state,
    ...action.payload.props,
  };
};

const scrollToIndexReducer: Reducer<InfiniteState, Action> = (
  state,
  action
) => {
  const { rect } = action.payload;
  const { index, align, animated } = action.payload.value;

  return {
    ...state,
    scrollTo: { rect, align, animated },
    scroll: animated ? { index, align, animated } : null,
  };
};

const scrollEndReducer: Reducer<InfiniteState, Action> = (state, action) => {
  return {
    ...state,
    scroll: null,
  };
};

const scrollRecalculateReducer: Reducer<InfiniteState, Action> = (
  state,
  action
) => {
  const { rect } = action.payload;
  const { scroll } = state;

  if (!scroll) {
    return state;
  }

  return scrollToIndexReducer(state, {
    type: 'scrollToIndex',
    payload: { value: scroll, rect },
  });
};
