import React from 'react';
import { usePad, defaultPadProps } from './usePad';

function Pad({
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
  enabled,
  shouldStart,
  onStart,
  onMove,
  onEnd,
  onCancel,
  ...props
}) {
  const [padProps] = usePad({
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
    enabled,
    shouldStart,
    onStart,
    onMove,
    onEnd,
    onCancel,
  });

  props.ref = padProps.ref;
  props.style = { ...padProps.style, ...props.style };
  props.children = padProps.render(props.children);

  return <div {...props} />;
}

Pad.defaultProps = defaultPadProps;

export default Pad;
