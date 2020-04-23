import React, {
  isValidElement,
  cloneElement,
  useMemo,
  useCallback,
  useReducer,
} from 'react';
import Pannable from '../Pannable';
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect';
import { usePrevRef } from '../hooks/usePrevRef';
import StyleSheet from '../utils/StyleSheet';
import {
  requestAnimationFrame,
  cancelAnimationFrame,
} from '../utils/animationFrame';
import { isEqualToSize } from '../utils/geometry';
import { reducer, initialState } from './padReducer';
import PadContext from './PadContext';
import GeneralContent from './GeneralContent';

const defaultPadProps = {
  width: 0,
  height: 0,
  pagingEnabled: false,
  directionalLockEnabled: false,
  alwaysBounceX: true,
  alwaysBounceY: true,
  onStateChange: () => {},
  onScroll: () => {},
  onDragStart: () => {},
  onDragEnd: () => {},
  onDecelerationStart: () => {},
  onDecelerationEnd: () => {},
  onContentResize: () => {},
  renderBackground: () => null,
  renderOverlay: () => null,
  scrollTo: null,
  scrollToRect: null,
  ...Pannable.defaultProps,
};

function Pad(props) {
  const {
    width,
    height,
    pagingEnabled,
    directionalLockEnabled,
    alwaysBounceX,
    alwaysBounceY,
    onStateChange,
    onScroll,
    onDragStart,
    onDragEnd,
    onDecelerationStart,
    onDecelerationEnd,
    onContentResize,
    renderBackground,
    renderOverlay,
    scrollTo,
    scrollToRect,
    children,
    ...pannableProps
  } = props;
  const { enabled, shouldStart } = pannableProps;
  const [state, dispatch] = useReducer(reducer, initialState);
  const prevStateRef = usePrevRef(state);
  const prevState = prevStateRef.current;

  const resizeContent = useCallback(
    contentSize => {
      if (!isEqualToSize(state.contentSize, contentSize)) {
        dispatch({ type: 'setContentSize', value: contentSize });
      }
    },
    [state.contentSize]
  );

  const shouldPannableStart = useCallback(
    evt => {
      if (
        directionalLockEnabled &&
        !shouldDragStart(evt.velocity, state.size, state.contentSize)
      ) {
        return false;
      }

      return shouldStart(evt);
    },
    [shouldStart, directionalLockEnabled, state.size, state.contentSize]
  );

  const onPannableStateChange = useCallback(value => {
    dispatch({ type: 'setPannable', value });
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (prevState.pannable.translation !== state.pannable.translation) {
      if (state.pannable.translation) {
        if (prevState.pannable.translation) {
          dispatch({ type: 'dragMove' });
        } else {
          dispatch({ type: 'dragStart' });
        }
      } else if (prevState.pannable.translation) {
        if (enabled) {
          dispatch({ type: 'dragEnd' });
        } else {
          dispatch({ type: 'dragCancel' });
        }
      }
    }

    if (prevState !== state) {
      onStateChange(state);
    }

    const output = {
      size: state.size,
      contentSize: state.contentSize,
      contentOffset: state.contentOffset,
      contentVelocity: state.contentVelocity,
      dragging: !!state.drag,
      decelerating: !!state.deceleration,
    };

    if (prevState.contentSize !== state.contentSize) {
      onContentResize(state.contentSize);
    }
    if (prevState.contentOffset !== state.contentOffset) {
      onScroll(output);
    }
    if (prevState.drag !== state.drag) {
      if (!prevState.drag) {
        onDragStart(output);
      } else if (!state.drag) {
        onDragEnd(output);
      }
    }
    if (prevState.deceleration !== state.deceleration) {
      if (!prevState.deceleration) {
        onDecelerationStart(output);
      } else if (!state.deceleration) {
        onDecelerationEnd(output);
      }
    }
  });

  useIsomorphicLayoutEffect(() => {
    if (!state.deceleration) {
      return;
    }

    const timer = requestAnimationFrame(() => {
      dispatch({ type: 'decelerate', now: new Date().getTime() });
    });

    return () => {
      cancelAnimationFrame(timer);
    };
  }, [state]);

  useMemo(() => {
    dispatch({ type: 'setSize', value: { width, height } });
  }, [width, height]);

  useMemo(() => {
    dispatch({
      type: 'setOptions',
      value: [
        pagingEnabled,
        directionalLockEnabled,
        alwaysBounceX,
        alwaysBounceY,
      ],
    });
  }, [pagingEnabled, directionalLockEnabled, alwaysBounceX, alwaysBounceY]);

  useMemo(() => {
    if (scrollTo) {
      dispatch({ type: 'scrollTo', ...scrollTo });
    }
  }, [scrollTo]);

  useMemo(() => {
    if (scrollToRect) {
      dispatch({ type: 'scrollToRect', ...scrollToRect });
    }
  }, [scrollToRect]);

  function buildContent() {
    const contentStyle = StyleSheet.create({
      position: 'absolute',
      width: state.contentSize.width,
      height: state.contentSize.height,
      transformTranslate: state.contentOffset,
      willChange: 'transform',
    });

    let element = typeof children === 'function' ? children(state) : children;

    if (isValidElement(element) && element.type.PadContent) {
      if (element.props.style) {
        Object.assign(contentStyle, element.props.style);
      }

      element = cloneElement(element, {
        style: contentStyle,
        ref: element.ref,
      });
    } else {
      element = <GeneralContent style={contentStyle}>{element}</GeneralContent>;
    }

    return element;
  }

  function buildBackground() {
    const element = renderBackground(state);

    if (element === null || element === undefined) {
      return null;
    }

    const elemStyle = {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    };

    return <div style={elemStyle}>{element}</div>;
  }

  function buildOverlay() {
    return renderOverlay(state);
  }

  pannableProps.shouldStart = shouldPannableStart;
  pannableProps.onStateChange = onPannableStateChange;

  const elemStyle = {
    overflow: 'hidden',
    position: 'relative',
    width: state.size.width,
    height: state.size.height,
  };

  if (pannableProps.style) {
    Object.assign(elemStyle, pannableProps.style);
  }

  pannableProps.style = elemStyle;

  const visibleRect = {
    x: -state.contentOffset.x,
    y: -state.contentOffset.y,
    width: state.size.width,
    height: state.size.height,
  };

  return (
    <Pannable {...pannableProps}>
      <PadContext.Provider value={{ visibleRect, resizeContent }}>
        {buildBackground()}
        {buildContent()}
        {buildOverlay()}
      </PadContext.Provider>
    </Pannable>
  );
}

Pad.defaultProps = defaultPadProps;

export default Pad;

function shouldDragStart(velocity, size, cSize) {
  const height =
    Math.abs(velocity.y) < Math.abs(velocity.x) ? 'width' : 'height';

  return size[height] < cSize[height];
}
