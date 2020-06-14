export const initialInfiniteState = {
  scrollTo: null,
  scroll: null,
};

export function reducer(state, action) {
  switch (action.type) {
    case 'setScrollTo':
      return setScrollToReducer(state, action);
    case 'scrollToIndex':
      return scrollToIndexReducer(state, action);
    case 'scrollEnd':
      return scrollEndReducer(state, action);
    case 'scrollRecalculate':
      return scrollRecalculateReducer(state, action);
    default:
      return state;
  }
}

function setScrollToReducer(state, action) {
  return {
    ...state,
    scrollTo: action.value,
  };
}

function scrollToIndexReducer(state, action) {
  const { list } = action;
  const { index, align, animated } = action.value;
  const rect = calculateRectForIndex(index, list);

  return {
    ...state,
    scrollTo: { rect, align, animated },
    scroll: animated ? { index, align } : null,
  };
}

function scrollEndReducer(state, action) {
  return {
    ...state,
    scroll: null,
  };
}

function scrollRecalculateReducer(state, action) {
  const { list } = action;
  const { scroll } = state;

  if (!scroll) {
    return state;
  }

  const { index, align } = scroll;
  const rect = calculateRectForIndex(index, list);

  return {
    ...state,
    scrollTo: { rect, align, animated: true },
  };
}

function calculateRectForIndex(index, list) {
  const { box, body } = list;
  let rect = { x: 0, y: 0, width: 0, height: 0 };

  if (box) {
    rect = box.layoutList[1].rect;
  }
  if (body) {
    if (isNaN(index)) {
      index = 0;
    }
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
