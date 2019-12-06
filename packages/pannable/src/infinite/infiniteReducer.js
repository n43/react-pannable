import { initialState as padInitialState } from '../pad/padReducer';

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

  return {
    ...state,
    scrollToRect: { rect, align, animated },
    scrolling: true,
  };
}

function endScrollingReducer(state, action) {
  return {
    ...state,
    scrolling: false,
  };
}
