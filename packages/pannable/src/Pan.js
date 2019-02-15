import React from 'react';

export default class Pan extends React.Component {
  render() {
    const { width, height } = this.props;
    const style = {
      touchAction: 'none',
      boxSizing: 'border-box',
      overflow: 'hidden',
      position: 'relative',
      WebkitOverflowScrolling: 'touch',
      willChange: 'transform',
      direction: 'ltr',
      width,
      height,
    };

    return <div style={style} />;
  }
}
