import React from 'react';
import { usePannable, defaultProps } from './usePannable';

function Pannable(props) {
  return <div {...usePannable(props)} />;
}
Pannable.defaultProps = defaultProps;

export default Pannable;
