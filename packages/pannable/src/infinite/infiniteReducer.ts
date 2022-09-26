import { ListLayout } from '../pad/ListContent';
import { initialPadState, PadScrollTo, PadState } from '../pad/padReducer';
import { Action, Rect } from '../interfaces';
import { Reducer } from 'react';

export type InfiniteLayout = {
  box?: ListLayout;
  body?: ListLayout;
};

export type InfiniteScrollTo = PadScrollTo & {
  index?: number;
  reverseRect?: Rect;
};

export type InfiniteMethods = {
  scrollTo: (params: InfiniteScrollTo) => void;
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
    case 'scrollTo':
      return scrollToReducer(state, action);
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

const scrollToReducer: Reducer<
  InfiniteState,
  Action<{ params: InfiniteScrollTo; layout: InfiniteLayout }>
> = (state, action) => {
  const { params, layout } = action.payload!;
  const nextScrollTo = { ...params };
  const { index, reverseRect } = params;

  if (index !== undefined) {
    nextScrollTo.rect = calculateRectForIndex(index, layout);
  } else if (reverseRect !== undefined) {
    nextScrollTo.rect = calculateRectForReverseRect(reverseRect, layout);
  }

  return {
    ...state,
    scrollTo: nextScrollTo,
    scroll: state.scroll || params,
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

  return scrollToReducer(state, {
    type: 'scrollTo',
    payload: { params: scroll, layout },
  });
};

function calculateRectForIndex(index: number, layout: InfiniteLayout): Rect {
  const { box, body } = layout;
  let rect: Rect = { x: 0, y: 0, width: 0, height: 0 };

  if (box && box.layoutList[1]) {
    rect = box.layoutList[1].rect;
  }
  if (body) {
    index = Math.min(index, body.layoutList.length - 1);

    if (index >= 0) {
      const attrs = body.layoutList[index];

      rect = {
        x: rect.x + attrs.rect.x,
        y: rect.y + attrs.rect.y,
        width: attrs.rect.width,
        height: attrs.rect.height,
      };
    }
  }

  return rect;
}

function calculateRectForReverseRect(
  rrect: Rect,
  layout: InfiniteLayout
): Rect {
  const { box } = layout;
  let rect: Rect = { x: 0, y: 0, width: rrect.width, height: rrect.height };

  if (box) {
    rect.x = box.size.width - rect.width - rrect.x;
    rect.y = box.size.height - rect.height - rrect.y;
  }

  return rect;
}
