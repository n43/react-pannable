import React from 'react';
import { usePad, defaultPadProps } from './usePad';

function Pad(padProps) {
  const [props] = usePad(padProps);

  return <div {...props} />;
}
Pad.defaultProps = defaultPadProps;

export default Pad;
