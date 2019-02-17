import React from 'react';
import Pannable from './Pannable';

export default class Pad extends React.Component {
  render() {
    const { width, height, style, children } = this.props;
    const wrapperStyle = { boxSizing: 'border-box', width, height, ...style };

    return <Pannable style={wrapperStyle}>{children}</Pannable>;
  }
}
