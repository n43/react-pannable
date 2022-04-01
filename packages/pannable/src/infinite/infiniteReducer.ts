import { ListLayout } from '../pad/ListContent';
import { initialPadState, PadScrollTo, PadState } from '../pad/padReducer';
import { XY, Action, Align, Rect } from '../interfaces';
import { Reducer } from 'react';

export type InfiniteLayout = {
  box?: ListLayout;
  body?: ListLayout;
};

export type InfiniteScrollTo = {
  index: number;
  align: Record<XY, Align> | Align;
  animated: boolean;
};

export type InfiniteMethods = {
  scrollToIndex: (params: InfiniteScrollTo) => void;
};

export type InfiniteState = {
  pad: PadState;
  scroll: InfiniteScrollTo | null;
  scrollTo: PadScrollTo | null;
};

export const initialInfiniteState: InfiniteState = {
  pad: initialPadState,
  scroll: null,
  scrollTo: null,
};

const reducer: Reducer<InfiniteState, Action> = (state, action) => {
  switch (action.type) {
    case 'setState':
      return setStateReducer(state, action);
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

const setStateReducer: Reducer<
  InfiniteState,
  Action<Partial<InfiniteState>>
> = (state, action) => {
  return {
    ...state,
    ...action.payload,
  };
};

const scrollToIndexReducer: Reducer<
  InfiniteState,
  Action<{ params: InfiniteScrollTo; layout: InfiniteLayout }>
> = (state, action) => {
  const {
    params: { index, align, animated },
    layout,
  } = action.payload!;
  const rect = calculateRectForIndex(index, layout);

  return {
    ...state,
    scrollTo: { rect, align, animated },
    scroll: state.scroll || { index, align, animated },
  };
};

const scrollEndReducer: Reducer<InfiniteState, Action> = (state, action) => {
  return {
    ...state,
    scroll: null,
  };
};

const scrollRecalculateReducer: Reducer<
  InfiniteState,
  Action<{ layout: InfiniteLayout }>
> = (state, action) => {
  const { layout } = action.payload!;
  const { scroll } = state;

  if (!scroll) {
    return state;
  }

  return scrollToIndexReducer(state, {
    type: 'scrollToIndex',
    payload: { params: scroll, layout },
  });
};

function calculateRectForIndex(index: number, layout: InfiniteLayout): Rect {
  const { box, body } = layout;
  let rect: Rect = { x: 0, y: 0, width: 0, height: 0 };

  if (box) {
    rect = box.layoutList[1].rect;
  }
  if (body) {
    index = Math.max(0, Math.min(index, body.layoutList.length - 1));
    const attrs = body.layoutList[index];

    rect = {
      x: rect.x + attrs.rect.x,
      y: rect.y + attrs.rect.y,
      width: attrs.rect.width,
      height: attrs.rect.height,
    };
  }

  return rect;
}
