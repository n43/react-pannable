import React, { useMemo, useCallback, useRef } from 'react';
import Pannable from '../Pannable';
import PadInner from './PadInner';

const defaultPadProps = {
  width: 0,
  height: 0,
  pagingEnabled: false,
  directionalLockEnabled: false,
  alwaysBounceX: true,
  alwaysBounceY: true,
  onScroll: () => {},
  onDragStart: () => {},
  onDragEnd: () => {},
  onDecelerationStart: () => {},
  onDecelerationEnd: () => {},
  onContentResize: () => {},
  renderBackground: () => null,
  renderOverlay: () => null,
  scrollTo: null,
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
    onScroll,
    onDragStart,
    onDragEnd,
    onDecelerationStart,
    onDecelerationEnd,
    onContentResize,
    renderBackground,
    renderOverlay,
    scrollTo,
    children,
    ...pannableProps
  } = props;
  const { shouldStart } = pannableProps;
  const size = useMemo(() => ({ width, height }), [width, height]);
  const alwaysBounce = useMemo(
    () => ({
      x: alwaysBounceX,
      y: alwaysBounceY,
    }),
    [alwaysBounceX, alwaysBounceY]
  );
  const innerRef = useRef();

  const shouldPannableStart = useCallback(
    evt => {
      const state = innerRef.current;

      if (!shouldDragStart(evt.velocity, state.size, state.contentSize)) {
        return false;
      }

      return shouldStart(evt);
    },
    [shouldStart]
  );

  pannableProps.shouldStart = shouldPannableStart;

  const pannableStyle = useMemo(() => {
    const style = {
      overflow: 'hidden',
      position: 'relative',
      width: size.width,
      height: size.height,
    };

    if (pannableProps.style) {
      Object.assign(style, pannableProps.style);
    }

    return style;
  }, [size, pannableProps.style]);

  pannableProps.style = pannableStyle;

  return (
    <Pannable {...pannableProps}>
      {pannable => {
        const padProps = {
          pannable,
          size,
          pagingEnabled,
          directionalLockEnabled,
          alwaysBounce,
          onScroll,
          onDragStart,
          onDragEnd,
          onDecelerationStart,
          onDecelerationEnd,
          onContentResize,
          renderBackground,
          renderOverlay,
          scrollTo,
        };

        return (
          <PadInner {...padProps}>
            {(state, methods) => {
              innerRef.current = state;

              return typeof children === 'function'
                ? children(state, methods)
                : children;
            }}
          </PadInner>
        );
      }}
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
