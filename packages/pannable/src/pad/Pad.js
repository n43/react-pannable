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
  isBoundlessX: false,
  isBoundlessY: false,
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
    isBoundlessX,
    isBoundlessY,
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
  const size = useMemo(() => ({ width, height }), [width, height]);
  const alwaysBounce = useMemo(
    () => ({
      x: alwaysBounceX,
      y: alwaysBounceY,
    }),
    [alwaysBounceX, alwaysBounceY]
  );
  const isBoundless = useMemo(
    () => ({
      x: isBoundlessX,
      y: isBoundlessY,
    }),
    [isBoundlessX, isBoundlessY]
  );
  const stateRef = useRef();
  const responseRef = useRef({});

  responseRef.current.shouldStart = pannableProps.shouldStart;

  const shouldPannableStart = useCallback(evt => {
    const state = stateRef.current;

    if (!state) {
      return false;
    }
    if (!shouldDragStart(evt.velocity, state.size, state.contentSize)) {
      return false;
    }

    return responseRef.current.shouldStart(evt);
  }, []);

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

  pannableProps.shouldStart = shouldPannableStart;
  pannableProps.style = pannableStyle;

  return (
    <Pannable {...pannableProps}>
      {pannable => (
        <PadInner
          pannable={pannable}
          size={size}
          pagingEnabled={pagingEnabled}
          directionalLockEnabled={directionalLockEnabled}
          alwaysBounce={alwaysBounce}
          isBoundless={isBoundless}
          onScroll={onScroll}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          onDecelerationStart={onDecelerationStart}
          onDecelerationEnd={onDecelerationEnd}
          onContentResize={onContentResize}
          renderBackground={renderBackground}
          renderOverlay={renderOverlay}
          scrollTo={scrollTo}
        >
          {(state, methods) => {
            stateRef.current = state;

            return typeof children === 'function'
              ? children(state, methods)
              : children;
          }}
        </PadInner>
      )}
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
