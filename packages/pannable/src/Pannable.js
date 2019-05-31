import React from 'react';
import { usePannable, defaultPannableProps } from './usePannable';

function Pannable(pannableProps) {
  const [props] = usePannable(pannableProps);

  return <div {...props} />;
}
Pannable.defaultProps = defaultPannableProps;

export default Pannable;
