import React, { useEffect } from 'react';
import { usePannable, defaultPannableProps } from './usePannable';

function Pannable({
  enabled,
  shouldStart,
  onStart,
  onMove,
  onEnd,
  onCancel,
  ...props
}) {
  const [pannableProps] = usePannable({
    enabled,
    shouldStart,
    onStart,
    onMove,
    onEnd,
    onCancel,
  });

  props.ref = pannableProps.ref;
  props.style = { ...pannableProps.style, ...props.style };

  useEffect(() => {
    console.log('pannable');
  });

  return <div {...props} />;
}

Pannable.defaultProps = defaultPannableProps;

export default Pannable;
