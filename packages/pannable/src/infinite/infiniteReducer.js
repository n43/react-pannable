export const initialState = {
  scrollToRect: null,
  scroll: null,
};

export function reducer(state, action) {
  switch (action.type) {
    case 'setScrollToRect':
      return setScrollToRectReducer(state, action);
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

function setScrollToRectReducer(state, action) {
  return {
    ...state,
    scrollToRect: action.value,
  };
}

function scrollToIndexReducer(state, action) {
  const { list } = action;
  const { index = 0, align, animated } = action.value;
  const rect = calculateRectForIndex(index, list);
  
  return {
    ...state,
    scrollToRect: { rect, align, animated },
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
    scrollToRect: { rect, align, animated: true },
  };
}

function calculateRectForIndex(index, list) {
  const { box, body } = list;
  let rect = { x: 0, y: 0, width: 0, height: 0 };

  if (box) {
    rect = box.layoutList[1].rect;
  }
  if (body) {
    const attrs = body.layoutList[index];

    if (attrs) {
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
